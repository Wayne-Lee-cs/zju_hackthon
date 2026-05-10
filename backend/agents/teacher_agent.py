from .base import BaseAgent
from ..models import MergeDecision


class TeacherAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.sessions: dict[str, list[dict]] = {}

    async def execute(self, message: str, session_id: str, decisions: list[MergeDecision]) -> dict:
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].append({"role": "user", "content": message})

        decisions_text = "\n".join([
            f"- {d.decision_id}: {d.action} {d.affected_nodes} → {d.result_node} (原因: {d.reason}, 置信度: {d.confidence})"
            for d in decisions
        ])
        prompt = f"""你是一个教学助手，帮助教师审查和修改知识整合决策。

当前整合决策：
{decisions_text}

教师消息：{message}

请：
1. 理解教师的意图（查询/修改）
2. 如果是查询，解释相关决策的理由
3. 如果是修改请求，说明需要如何修改决策
4. 返回更新后的整合摘要"""
        messages = [
            {"role": "system", "content": prompt},
            *self.sessions[session_id],
        ]
        reply = await self.llm.chat(messages, temperature=0.7)
        self.sessions[session_id].append({"role": "assistant", "content": reply})
        return {"reply": reply, "updated_decisions": decisions}
