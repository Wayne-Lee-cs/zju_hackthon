from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "mimo-v2.5-pro"
    LLM_BASE_URL: str = "https://token-plan-cn.xiaomimimo.com/v1"
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

    @property
    def api_key(self) -> str:
        return self.LLM_API_KEY or os.environ.get("API_KEY", "tp-cnvuoiyluur8gb2qpdy1zm5nqvac1lu5kd0s4l89e4vgdbjb")


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()