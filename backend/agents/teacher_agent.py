from .base import BaseAgent
from ..models import MergeDecision
from ..rag.retriever import retrieve
from ..rag.store import ChromaStore


class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.sessions: dict[str, list[dict]] = {}
        self.store = ChromaStore()

    async def execute(self, message: str, session_id: str, decisions: list[MergeDecision]) -> dict:
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({"role": "user", "content": message})

        # Step 1: 检索 RAG 获取相关知识
        rag_chunks = await retrieve(message, top_k=3)
        rag_context = "\n\n".join([
            f"[{c['metadata']['textbook']}, {c['metadata']['chapter']}, 第{c['metadata']['page']}页]\n{c['text']}"
            for c in rag_chunks
        ]) if rag_chunks else "（知识库中未找到相关内容）"

        # Step 2: 构建决策上下文
        decisions_text = "\n".join([
            f"- {d.decision_id}: {d.action} {d.affected_nodes} → {d.result_node} (原因: {d.reason}, 置信度: {d.confidence})"
            for d in decisions
        ]) if decisions else "（暂无整合决策）"

        prompt = f"""你是一个教学助手，帮助学习者理解学科知识。

参考知识：
{rag_context}

当前知识整合决策：
{decisions_text}

学习者问题：{message}

请：
1. 基于参考知识回答学习者问题
2. 如果有相关的整合决策，说明决策理由
3. 回答要通俗易懂，适合学习者理解"""

        messages = [
            {"role": "system", "content": prompt},
            *self.sessions[session_id],
        ]
        reply = await self.llm.chat(messages, temperature=0.7)
        self.sessions[session_id].append({"role": "assistant", "content": reply})

        citations = [
            {"textbook": c['metadata']['textbook'], "chapter": c['metadata']['chapter'], "page": c['metadata']['page']}
            for c in rag_chunks
        ]
        return {"reply": reply, "updated_decisions": decisions, "citations": citations}
