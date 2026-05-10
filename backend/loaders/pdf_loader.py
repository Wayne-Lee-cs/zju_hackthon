import os
import re
import fitz
from ..models import Textbook, Chapter


def load_pdf(file_path: str, filename: str) -> Textbook:
    doc = fitz.open(file_path)
    total_pages = len(doc)
    chapters = []
    current_chapter = None
    current_content = []
    chapter_pattern = re.compile(r'(第[一二三四五六七八九十\d]+章|Chapter\s+\d+)', re.IGNORECASE)

    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text()
        lines = text.split('\n')
        for line in lines:
            if chapter_pattern.match(line.strip()):
                if current_chapter:
                    content = '\n'.join(current_content)
                    chapters.append(Chapter(
                        chapter_id=f"ch_{len(chapters)+1}",
                        title=current_chapter,
                        page_start=current_page_start,
                        page_end=page_num,
                        content=content,
                        char_count=len(content)
                    ))
                current_chapter = line.strip()
                current_content = []
                current_page_start = page_num + 1
            else:
                current_content.append(line)

    if current_chapter:
        content = '\n'.join(current_content)
        chapters.append(Chapter(
            chapter_id=f"ch_{len(chapters)+1}",
            title=current_chapter,
            page_start=current_page_start,
            page_end=total_pages,
            content=content,
            char_count=len(content)
        ))

    if not chapters:
        content = '\n'.join([page.get_text() for page in doc])
        chapters.append(Chapter(
            chapter_id="ch_1",
            title="全文",
            page_start=1,
            page_end=total_pages,
            content=content,
            char_count=len(content)
        ))

    doc.close()
    total_chars = sum(ch.char_count for ch in chapters)
    title = os.path.splitext(filename)[0]
    return Textbook(
        textbook_id=f"book_{hash(filename) % 10000:04d}",
        filename=filename,
        title=title,
        total_pages=total_pages,
        total_chars=total_chars,
        chapters=chapters
    )
