from .base import BaseAgent
from ..models import MergeDecision
from ..knowledge_graph.merger import merge_graphs


class MergeAgent(BaseAgent):
    async def execute(self, graphs: list[dict]) -> tuple[dict, list[MergeDecision]]:
        return await merge_graphs(self.llm, graphs)
