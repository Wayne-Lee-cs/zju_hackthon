from fastapi import APIRouter, HTTPException
from ..agents.kg_agent import KGAgent
from ..knowledge_graph.serializer import to_echarts
from .books import books_db

router = APIRouter()
kg_agent = KGAgent()

graphs_db = {}


@router.post("/api/books/{book_id}/build-kg")
async def build_kg(book_id: str):
    if book_id not in books_db:
        raise HTTPException(404, "教材不存在")
    book = books_db[book_id]
    result = await kg_agent.execute(book)
    graphs_db[book_id] = result
    return {"status": "completed", "nodes": len(result.get("nodes", []))}


@router.get("/api/books/{book_id}/kg")
async def get_kg(book_id: str):
    if book_id not in graphs_db:
        raise HTTPException(404, "知识图谱未构建")
    return to_echarts(graphs_db[book_id]["graph"])


@router.get("/api/kg/merged")
async def get_merged_kg():
    all_nodes = []
    all_relations = []
    for graph in graphs_db.values():
        all_nodes.extend(graph.get("nodes", []))
        all_relations.extend(graph.get("relations", []))
    return {"nodes": all_nodes, "relations": all_relations}
