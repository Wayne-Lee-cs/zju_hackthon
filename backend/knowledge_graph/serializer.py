import networkx as nx


def to_echarts(graph_data: dict) -> dict:
    G = nx.node_link_graph(graph_data)
    categories = [
        {"name": "核心概念"},
        {"name": "定理"},
        {"name": "方法"},
        {"name": "现象"},
    ]
    category_map = {cat["name"]: i for i, cat in enumerate(categories)}

    nodes = []
    for node_id, attrs in G.nodes(data=True):
        nodes.append({
            "id": node_id,
            "name": attrs.get("name", node_id),
            "category": category_map.get(attrs.get("category", ""), 0),
            "symbolSize": 20 + attrs.get("frequency", 1) * 5,
            "value": attrs,
        })

    links = []
    for source, target, attrs in G.edges(data=True):
        links.append({
            "source": source,
            "target": target,
            "label": attrs.get("relation_type", ""),
        })

    return {
        "nodes": nodes,
        "links": links,
        "categories": categories,
    }
