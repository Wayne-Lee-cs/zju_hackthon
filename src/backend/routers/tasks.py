from fastapi import APIRouter

router = APIRouter()

tasks_db = {}


@router.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks_db:
        return {"error": "Task not found"}
    return tasks_db[task_id]
