import asyncio
from anthropic import AsyncAnthropic
from .base import BaseLLM
from ..config import settings


class AnthropicProvider(BaseLLM):
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.LLM_API_KEY)
        self.model = settings.LLM_MODEL

    async def chat(self, messages: list[dict], temperature: float = 0.7, max_tokens: int = 4096) -> str:
        system_msg = ""
        user_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_msg = msg["content"]
            else:
                user_messages.append(msg)

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_msg,
                    messages=user_messages,
                )
                return response.content[0].text
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
