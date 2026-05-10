from .base import BaseAgent
from .parser_agent import ParserAgent
from .kg_agent import KGAgent
from .merge_agent import MergeAgent
from .compressor_agent import CompressorAgent


class OrchestratorAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.parser = ParserAgent()
        self.kg_agent = KGAgent()
        self.merge_agent = MergeAgent()
        self.compressor = CompressorAgent()

    async def execute(self, file_paths: list[str]) -> dict:
        textbooks = []
        graphs = []
        for path in file_paths:
            filename = path.split("/")[-1]
            textbook = await self.parser.execute(path, filename)
            textbooks.append(textbook)
            graph = await self.kg_agent.execute(textbook)
            graphs.append(graph)

        if len(graphs) > 1:
            merged, decisions = await self.merge_agent.execute(graphs)
            compressed = await self.compressor.execute(merged, textbooks)
        else:
            merged = graphs[0] if graphs else {}
            decisions = []
            compressed = {}

        return {
            "textbooks": textbooks,
            "graphs": graphs,
            "merged": merged,
            "decisions": decisions,
            "compressed": compressed,
        }
