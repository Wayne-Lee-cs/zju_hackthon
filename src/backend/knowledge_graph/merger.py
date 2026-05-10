import networkx as nx
from ..llm.base import BaseLLM
from ..models import MergeDecision


async def merge_graphs(llm: BaseLLM, graphs: list[dict]) -> tuple[dict, list[MergeDecision]]:
    # Step 1: 按名称合并同名节点
    all_nodes = {}
    for graph in graphs:
        for node in graph.get("nodes", []):
            key = node["name"]
            if key in all_nodes:
                all_nodes[key]["sources"] = list(set(all_nodes[key].get("sources", []) + node.get("sources", [])))
                all_nodes[key]["frequency"] = all_nodes[key].get("frequency", 1) + node.get("frequency", 1)
            else:
                all_nodes[key] = node.copy()

    # Step 2: 使用单次 LLM 调用判断语义相似节点
    decisions = []
    nodes_to_remove = set()
    node_list = list(all_nodes.values())

    if len(node_list) > 1:
        # 构建批量判断 prompt
        pairs_text = []
        for i in range(min(len(node_list), 20)):  # 限制最多20个节点
            for j in range(i + 1, min(len(node_list), 20)):
                n1, n2 = node_list[i], node_list[j]
                pairs_text.append(f"{i+1}.{n1['name']} vs {j+1}.{n2['name']}")

        if pairs_text:
            pairs_str = "\n".join(pairs_text[:50])  # 限制50对
            prompt = f"""判断以下知识点对是否语义等价应该合并：

{pairs_str}

对每对需要合并的，返回JSON数组：
[{{"node1": "名称1", "node2": "名称2", "reason": "原因"}}]

不需要合并的不要列出。"""

            messages = [{"role": "user", "content": prompt}]
            try:
                result_text = await llm.chat(messages, temperature=0.3)
                import json
                import re
                json_match = re.search(r'\[[\s\S]*\]', result_text)
                if json_match:
                    merge_pairs = json.loads(json_match.group())
                    for pair in merge_pairs:
                        n1_name = pair.get("node1", "")
                        n2_name = pair.get("node2", "")
                        if n1_name in all_nodes and n2_name in all_nodes:
                            decisions.append(MergeDecision(
                                decision_id=f"merge_{len(decisions)+1:03d}",
                                action="merge",
                                affected_nodes=[all_nodes[n1_name]["id"], all_nodes[n2_name]["id"]],
                                result_node=all_nodes[n1_name]["id"],
                                reason=pair.get("reason", "语义等价"),
                                confidence=0.85,
                            ))
                            # 合并 sources 到第一个节点
                            all_nodes[n1_name]["sources"] = list(set(
                                all_nodes[n1_name].get("sources", []) + all_nodes[n2_name].get("sources", [])
                            ))
                            nodes_to_remove.add(n2_name)
            except Exception:
                pass

    # Step 3: 移除被合并的节点
    for name in nodes_to_remove:
        del all_nodes[name]

    # Step 4: 构建合并后的图
    G = nx.DiGraph()
    for node in all_nodes.values():
        G.add_node(node["id"], **node)

    # 重建关系（过滤掉被删除节点的关系）
    node_ids = {node["id"] for node in all_nodes.values()}
    for graph in graphs:
        for rel in graph.get("relations", []):
            if rel["source"] in node_ids and rel["target"] in node_ids:
                if not G.has_edge(rel["source"], rel["target"]):
                    G.add_edge(rel["source"], rel["target"], **rel)

    merged = {
        "graph": nx.node_link_data(G),
        "nodes": list(all_nodes.values()),
        "decisions": [d.model_dump() for d in decisions],
    }
    return merged, decisions
