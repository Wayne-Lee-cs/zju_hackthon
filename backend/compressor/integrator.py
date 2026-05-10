from ..llm.base import BaseLLM


async def compress_content(llm: BaseLLM, merged_graph: dict, textbooks: list) -> dict:
    nodes = merged_graph.get("nodes", [])
    outline = "\n".join([f"- {n.get('name', '')}: {n.get('definition', '')}" for n in nodes[:50]])

    prompt = f"""基于以下知识图谱节点，生成精华版内容大纲：

{outline}

要求：
1. 保留核心知识点
2. 合并重复内容
3. 保持教学连贯性
4. 标注每个知识点的来源教材"""

    messages = [{"role": "user", "content": prompt}]
    result = await llm.chat(messages, temperature=0.5)

    # 支持 Textbook 对象和字典
    original_chars = 0
    for t in textbooks:
        if hasattr(t, 'total_chars'):
            original_chars += t.total_chars
        elif isinstance(t, dict):
            original_chars += t.get("total_chars", 0)

    compressed_chars = len(result)
    ratio = compressed_chars / original_chars if original_chars > 0 else 0

    return {
        "content": result,
        "original_chars": original_chars,
        "compressed_chars": compressed_chars,
        "ratio": ratio,
    }
