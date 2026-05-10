from .base import BaseAgent
from ..models import RAGResponse, Citation
from ..rag.retriever import retrieve


class RAGAgent(BaseAgent):
    async def execute(self, question: str) -> RAGResponse:
        chunks = await retrieve(question, top_k=5)
        context = "\n\n".join([
            f"[{c['metadata']['textbook']}, {c['metadata']['chapter']}, 第{c['metadata']['page']}页]\n{c['text']}"
            for c in chunks
        ])
        prompt = f"""基于以下参考资料回答问题。要求：
1. 只基于参考资料回答，不要使用自身知识
2. 每句话标注来源 [教材名称, 第X章, 第X页]
3. 如果找不到答案，回复"当前知识库中未找到相关信息"

参考资料：
{context}

问题：{question}"""
        messages = [{"role": "user", "content": prompt}]
        answer = await self.llm.chat(messages, temperature=0.3)
        citations = [
            Citation(
                textbook=c['metadata']['textbook'],
                chapter=c['metadata']['chapter'],
                page=c['metadata']['page'],
                relevance_score=c.get('score', 0.0)
            )
            for c in chunks
        ]
        return RAGResponse(
            answer=answer,
            citations=citations,
            source_chunks=[c['text'] for c in chunks]
        )
