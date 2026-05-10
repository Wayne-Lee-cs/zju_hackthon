from fastapi import APIRouter, HTTPException
from ..agents.merge_agent import MergeAgent
from ..agents.compressor_agent import CompressorAgent
from .kg import graphs_db
from .books import books_db

router = APIRouter()
merge_agent = MergeAgent()
compress_agent = CompressorAgent()

decisions_db = []
compress_result = None


@router.post("/api/merge")
async def trigger_merge():
    graphs = list(graphs_db.values())
    if len(graphs) < 2:
        raise HTTPException(400, "至少需要2本教材才能进行整合")
    merged, decisions = await merge_agent.execute(graphs)
    decisions_db.clear()
    decisions_db.extend(decisions)
    return {"status": "completed", "decisions": len(decisions)}


@router.get("/api/merge/decisions")
async def get_decisions():
    return {"decisions": [d.model_dump() for d in decisions_db]}


@router.post("/api/compress")
async def trigger_compress():
    graphs = list(graphs_db.values())
    textbooks = list(books_db.values())
    if not graphs:
        raise HTTPException(400, "没有知识图谱可压缩")
    merged, _ = await merge_agent.execute(graphs)
    global compress_result
    compress_result = await compress_agent.execute(merged, textbooks)
    return {"status": "completed"}


@router.get("/api/compress/result")
async def get_compress_result():
    if compress_result is None:
        raise HTTPException(404, "尚未执行压缩")
    return compress_result


@router.get("/api/compress/stats")
async def get_compress_stats():
    if compress_result is None:
        raise HTTPException(404, "尚未执行压缩")
    return {
        "original_chars": compress_result["original_chars"],
        "compressed_chars": compress_result["compressed_chars"],
        "ratio": compress_result["ratio"],
    }
