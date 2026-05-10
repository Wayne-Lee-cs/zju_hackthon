from pydantic import BaseModel


class Chapter(BaseModel):
    chapter_id: str
    title: str
    page_start: int
    page_end: int
    content: str
    char_count: int


class Textbook(BaseModel):
    textbook_id: str
    filename: str
    title: str
    total_pages: int
    total_chars: int
    chapters: list[Chapter]


class KnowledgeNode(BaseModel):
    id: str
    name: str
    definition: str
    category: str
    chapter: str
    page: int
    sources: list[str]
    frequency: int


class KnowledgeRelation(BaseModel):
    source: str
    target: str
    relation_type: str
    description: str


class MergeDecision(BaseModel):
    decision_id: str
    action: str
    affected_nodes: list[str]
    result_node: str
    reason: str
    confidence: float


class Citation(BaseModel):
    textbook: str
    chapter: str
    page: int
    relevance_score: float


class RAGResponse(BaseModel):
    answer: str
    citations: list[Citation]
    source_chunks: list[str]
