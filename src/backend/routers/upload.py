import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..agents.parser_agent import ParserAgent
from ..rag.chunker import chunk_text
from ..rag.store import ChromaStore
from .books import books_db

router = APIRouter()
parser = ParserAgent()
store = ChromaStore()

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.md', '.txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    results = []
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"不支持的文件格式: {ext}")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(400, f"文件过大: {file.filename}")

        safe_name = os.path.basename(file.filename)
        file_path = f"data/textbooks/{safe_name}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)

        textbook = await parser.execute(file_path, safe_name)
        books_db[textbook.textbook_id] = textbook

        for chapter in textbook.chapters:
            chunks = chunk_text(chapter.content, {
                "textbook": textbook.title,
                "chapter": chapter.title,
                "page": chapter.page_start,
            })
            store.add_chunks(chunks)

        results.append({
            "textbook_id": textbook.textbook_id,
            "filename": textbook.filename,
            "title": textbook.title,
            "total_chars": textbook.total_chars,
            "chapters": len(textbook.chapters),
        })
    return {"textbooks": results}
