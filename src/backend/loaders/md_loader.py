import os
import re
from ..models import Textbook, Chapter


def load_md(file_path: str, filename: str) -> Textbook:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    chapters = []
    parts = re.split(r'^#{1,2}\s+', content, flags=re.MULTILINE)

    for i, part in enumerate(parts):
        if not part.strip():
            continue
        lines = part.split('\n', 1)
        title = lines[0].strip()
        body = lines[1] if len(lines) > 1 else ""
        chapters.append(Chapter(
            chapter_id=f"ch_{i+1}",
            title=title,
            page_start=0,
            page_end=0,
            content=body,
            char_count=len(body)
        ))

    if not chapters:
        chapters.append(Chapter(
            chapter_id="ch_1",
            title="全文",
            page_start=0,
            page_end=0,
            content=content,
            char_count=len(content)
        ))

    total_chars = sum(ch.char_count for ch in chapters)
    title = os.path.splitext(filename)[0]
    return Textbook(
        textbook_id=f"book_{hash(filename) % 10000:04d}",
        filename=filename,
        title=title,
        total_pages=0,
        total_chars=total_chars,
        chapters=chapters
    )
