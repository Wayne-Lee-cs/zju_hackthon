from fastapi import APIRouter
from pydantic import BaseModel
from ..agents.teacher_agent import TeacherAgent
from .merge import decisions_db

router = APIRouter()
teacher_agent = TeacherAgent()


class ChatRequest(BaseModel):
    message: str
    session_id: str


@router.post("/api/teacher/chat")
async def teacher_chat(request: ChatRequest):
    try:
        return await teacher_agent.execute(
            request.message,
            request.session_id,
            decisions_db,
        )
    except Exception as e:
        return {"reply": f"处理请求时出错: {str(e)}", "updated_decisions": decisions_db}


@router.get("/api/teacher/history/{session_id}")
async def get_history(session_id: str):
    if session_id not in teacher_agent.sessions:
        return {"history": []}
    return {"history": teacher_agent.sessions[session_id]}
