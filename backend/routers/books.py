from fastapi import APIRouter, HTTPException
from ..models import Textbook

router = APIRouter()

books_db: dict[str, Textbook] = {}


@router.get("/api/books")
async def list_books():
    return {"books": [b.model_dump() for b in books_db.values()]}


@router.get("/api/books/{book_id}")
async def get_book(book_id: str):
    if book_id not in books_db:
        raise HTTPException(404, "教材不存在")
    return books_db[book_id].model_dump()
