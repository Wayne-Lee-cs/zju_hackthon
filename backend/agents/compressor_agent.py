from .base import BaseAgent
from ..compressor.integrator import compress_content


class CompressorAgent(BaseAgent):
    async def execute(self, merged_graph: dict, textbooks: list) -> dict:
        return await compress_content(self.llm, merged_graph, textbooks)
