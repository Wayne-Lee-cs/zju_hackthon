from ..llm.base import BaseLLM
from ..models import Chapter, KnowledgeNode, KnowledgeRelation


async def extract_knowledge(llm: BaseLLM, textbook_title: str, chapter: Chapter) -> tuple[list[KnowledgeNode], list[KnowledgeRelation]]:
    prompt = f"""从以下教材章节中提取知识点和关系。

要求：
1. 提取核心概念、定理、方法、现象等知识点
2. 识别知识点之间的关系（prerequisite/parallel/contains/applies_to）
3. 严格按照以下JSON格式输出

知识点格式：
{{"id": "node_XXX", "name": "知识点名称", "definition": "定义", "category": "核心概念/定理/方法/现象", "chapter": "{chapter.title}", "page": 页码}}

关系格式：
{{"source": "node_XXX", "target": "node_YYY", "relation_type": "prerequisite/parallel/contains/applies_to", "description": "关系描述"}}

请输出JSON数组，格式如下：
{{"nodes": [...], "relations": [...]}}"""

    text = f"教材：{textbook_title}\n章节：{chapter.title}\n\n{chapter.content[:3000]}"
    result = await llm.extract_json(prompt, text)

    nodes = []
    for node in result.get("nodes", []):
        try:
            nodes.append(KnowledgeNode(
                id=node.get("id", f"node_{len(nodes)+1:03d}"),
                name=node.get("name", "未知"),
                definition=node.get("definition", ""),
                category=node.get("category", "核心概念"),
                chapter=node.get("chapter", chapter.title),
                page=node.get("page", chapter.page_start),
                sources=[textbook_title],
                frequency=1,
            ))
        except Exception:
            continue

    relations = []
    for rel in result.get("relations", []):
        try:
            relations.append(KnowledgeRelation(**rel))
        except Exception:
            continue

    return nodes, relations
