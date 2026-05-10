from fastapi import APIRouter
from pydantic import BaseModel
from ..agents.rag_agent import RAGAgent
from ..rag.store import ChromaStore

router = APIRouter()
rag_agent = RAGAgent()
store = ChromaStore()


class QueryRequest(BaseModel):
    question: str


@router.post("/api/rag/query")
async def query_rag(request: QueryRequest):
    return await rag_agent.execute(request.question)


@router.get("/api/rag/status")
async def rag_status():
    return {
        "indexed": store.get_count() > 0,
        "chunks": store.get_count(),
    }
