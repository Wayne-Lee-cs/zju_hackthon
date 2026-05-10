import os
import asyncio
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..agents.parser_agent import ParserAgent
from ..agents.kg_agent import KGAgent
from ..agents.merge_agent import MergeAgent
from ..agents.compressor_agent import CompressorAgent
from ..rag.chunker import chunk_text
from ..rag.store import ChromaStore
from .books import books_db

router = APIRouter()
parser = ParserAgent()
kg_agent = KGAgent()
merge_agent = MergeAgent()
compressor = CompressorAgent()
store = ChromaStore()

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.md', '.txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


async def process_single_file(file: UploadFile) -> dict:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"不支持的文件格式: {ext}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, f"文件过大: {file.filename}")

    safe_name = os.path.basename(file.filename)
    base_dir = Path("data/textbooks").resolve()
    dest = (base_dir / safe_name).resolve()

    # 防止路径遍历攻击
    if not dest.is_relative_to(base_dir):
        raise HTTPException(400, "非法文件路径")

    dest.parent.mkdir(parents=True, exist_ok=True)
    with open(dest, "wb") as f:
        f.write(content)

    # Step 1: Parser 解析教材
    textbook = await parser.execute(str(dest), safe_name)
    books_db[textbook.textbook_id] = textbook

    # Step 2: KGAgent 提取知识图谱
    graph = await kg_agent.execute(textbook)

    # Step 2.1: 持久化图谱到磁盘
    kg_agent.builder.save(graph, textbook.textbook_id)

    # Step 3: RAG 存储 chunks
    for chapter in textbook.chapters:
        chunks = chunk_text(chapter.content, {
            "textbook": textbook.title,
            "chapter": chapter.title,
            "page": chapter.page_start,
        })
        store.add_chunks(chunks)

    return {
        "textbook_id": textbook.textbook_id,
        "filename": textbook.filename,
        "title": textbook.title,
        "total_chars": textbook.total_chars,
        "chapters": len(textbook.chapters),
        "graph_nodes": len(graph.get("nodes", [])),
        "graph_relations": len(graph.get("relations", [])),
    }


@router.post("/api/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    # 并行处理多个文件
    results = await asyncio.gather(*[process_single_file(f) for f in files])

    # 如果有多个图谱，进行合并和压缩
    if len(results) > 1:
        graphs = []
        for r in results:
            # 从 books_db 获取图谱（需要kg_agent构建）
            textbook = books_db.get(r["textbook_id"])
            if textbook:
                graph = await kg_agent.execute(textbook)
                graphs.append(graph)

        if len(graphs) > 1:
            merged, decisions = await merge_agent.execute(graphs)
            compressed = await compressor.execute(merged, list(books_db.values()))
            # compressed 图谱可以存储或返回，这里暂时记录决策数量
            for result in results:
                result["merged"] = True
                result["decisions_count"] = len(decisions)

    return {"textbooks": results}
