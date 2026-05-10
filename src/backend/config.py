from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"

    class Config:
        env_file = ".env"


settings = Settings()
