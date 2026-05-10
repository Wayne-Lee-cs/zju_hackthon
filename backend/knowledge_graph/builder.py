import os
import json
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

    def save(self, graph_data: dict, textbook_id: str) -> str:
        """Save graph to disk, returns the saved file path."""
        graphs_dir = os.path.join("data", "graphs")
        os.makedirs(graphs_dir, exist_ok=True)
        file_path = os.path.join(graphs_dir, f"{textbook_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, ensure_ascii=False, indent=2)
        return file_path

    def load(self, textbook_id: str) -> dict | None:
        """Load graph from disk, returns None if not found."""
        file_path = os.path.join("data", "graphs", f"{textbook_id}.json")
        if not os.path.exists(file_path):
            return None
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def load_all(self) -> list[dict]:
        """Load all saved graphs."""
        graphs_dir = os.path.join("data", "graphs")
        if not os.path.exists(graphs_dir):
            return []
        graphs = []
        for filename in os.listdir(graphs_dir):
            if filename.endswith(".json"):
                file_path = os.path.join(graphs_dir, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    graphs.append(json.load(f))
        return graphs
