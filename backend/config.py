from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""  # From env or .env
    LLM_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    LLM_BASE_URL: str = "https://api.modelscope.cn/v1"
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

    @property
    def api_key(self) -> str:
        # Check both .env API_KEY and direct LLM_API_KEY
        return self.LLM_API_KEY or os.environ.get("API_KEY", "")


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()