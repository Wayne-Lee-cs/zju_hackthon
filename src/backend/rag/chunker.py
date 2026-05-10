from ..config import settings


def chunk_text(text: str, metadata: dict) -> list[dict]:
    chunks = []
    chunk_size = settings.CHUNK_SIZE
    chunk_overlap = settings.CHUNK_OVERLAP

    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunk_text = text[i:i + chunk_size]
        if len(chunk_text) < 50:
            break
        chunks.append({
            "text": chunk_text,
            "metadata": {
                **metadata,
                "chunk_id": f"{metadata.get('textbook', '')}_{metadata.get('chapter', '')}_{i}",
            }
        })
    return chunks
