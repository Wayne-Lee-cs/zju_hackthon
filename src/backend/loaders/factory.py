import os
from ..models import Textbook
from .pdf_loader import load_pdf
from .docx_loader import load_docx
from .md_loader import load_md
from .txt_loader import load_txt


def load_textbook(file_path: str, filename: str) -> Textbook:
    ext = os.path.splitext(filename)[1].lower()
    loaders = {
        ".pdf": load_pdf,
        ".docx": load_docx,
        ".md": load_md,
        ".txt": load_txt,
    }
    loader = loaders.get(ext)
    if not loader:
        raise ValueError(f"不支持的文件格式: {ext}")
    return loader(file_path, filename)
