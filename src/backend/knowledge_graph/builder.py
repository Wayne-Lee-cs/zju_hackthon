import networkx as nx
from ..models import KnowledgeNode, KnowledgeRelation


class KnowledgeGraphBuilder:
    def build(self, textbook_id: str, nodes: list[KnowledgeNode], relations: list[KnowledgeRelation]) -> dict:
        G = nx.DiGraph()
        for node in nodes:
            G.add_node(node.id, **node.model_dump())
        for rel in relations:
            G.add_edge(rel.source, rel.target, **rel.model_dump())
        return {
            "textbook_id": textbook_id,
            "graph": nx.node_link_data(G),
            "nodes": [node.model_dump() for node in nodes],
            "relations": [rel.model_dump() for rel in relations],
        }
