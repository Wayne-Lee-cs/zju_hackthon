import os
import chromadb
from sentence_transformers import SentenceTransformer
from ..config import settings


class ChromaStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        chroma_path = os.path.join("data", "chroma")
        os.makedirs(chroma_path, exist_ok=True)
        self.client = chromadb.PersistentClient(path=chroma_path)
        self.collection = self.client.get_or_create_collection("knowledge")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def add_chunks(self, chunks: list[dict]):
        if not chunks:
            return
        texts = [c["text"] for c in chunks]
        embeddings = self.model.encode(texts).tolist()
        ids = [c["metadata"]["chunk_id"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        self.collection.upsert(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids,
        )

    def query(self, text: str, top_k: int = 5) -> list[dict]:
        if self.collection.count() == 0:
            return []
        embedding = self.model.encode([text]).tolist()
        results = self.collection.query(
            query_embeddings=embedding,
            n_results=min(top_k, self.collection.count()),
        )
        chunks = []
        for i in range(len(results["documents"][0])):
            chunks.append({
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": results["distances"][0][i] if results.get("distances") else 0.0,
            })
        return chunks

    def get_count(self) -> int:
        return self.collection.count()
