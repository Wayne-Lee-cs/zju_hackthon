from .base import BaseAgent
from ..models import Textbook, KnowledgeNode, KnowledgeRelation
from ..knowledge_graph.extractor import extract_knowledge
from ..knowledge_graph.builder import KnowledgeGraphBuilder


class KGAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.builder = KnowledgeGraphBuilder()

    async def execute(self, textbook: Textbook) -> dict:
        all_nodes = []
        all_relations = []
        for chapter in textbook.chapters:
            nodes, relations = await extract_knowledge(
                self.llm, textbook.title, chapter
            )
            all_nodes.extend(nodes)
            all_relations.extend(relations)
        return self.builder.build(textbook.textbook_id, all_nodes, all_relations)
