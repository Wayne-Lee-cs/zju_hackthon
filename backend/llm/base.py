from abc import ABC, abstractmethod
import json
import re


class BaseLLM(ABC):
    @abstractmethod
    async def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 4096) -> str:
        pass

    async def extract_json(self, prompt: str, text: str) -> dict:
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text},
        ]
        response = await self.chat(messages, temperature=0.3, max_tokens=4096)
        return self._parse_json(response)

    def _parse_json(self, text: str) -> dict:
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        json_match = re.search(r'\[[\s\S]*\]', text)
        if json_match:
            try:
                return {"items": json.loads(json_match.group())}
            except json.JSONDecodeError:
                pass
        return {}
