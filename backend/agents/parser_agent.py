from .base import BaseAgent
from ..loaders import load_textbook
from ..models import Textbook


class ParserAgent(BaseAgent):
    async def execute(self, file_path: str, filename: str) -> Textbook:
        return load_textbook(file_path, filename)
