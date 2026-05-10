from .base import BaseLLM
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .ollama_provider import OllamaProvider
from ..config import settings


def get_llm() -> BaseLLM:
    providers = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
    }
    provider_cls = providers.get(settings.LLM_PROVIDER, OpenAIProvider)
    return provider_cls()
