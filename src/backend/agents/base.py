from abc import ABC, abstractmethod
from ..llm import get_llm


class BaseAgent(ABC):
    def __init__(self):
        self.llm = get_llm()

    @abstractmethod
    async def execute(self, **kwargs):
        pass
