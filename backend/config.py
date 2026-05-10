from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    LLM_BASE_URL: str = "https://api.modelscope.cn/v1"
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"


settings = Settings()