from .store import ChromaStore

store = ChromaStore()


async def retrieve(question: str, top_k: int = 5) -> list[dict]:
    return store.query(question, top_k)
