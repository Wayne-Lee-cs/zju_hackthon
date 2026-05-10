export interface Chapter {
  chapter_id: string
  title: string
  page_start: number
  page_end: number
  content: string
  char_count: number
}

export interface Textbook {
  textbook_id: string
  filename: string
  title: string
  total_pages: number
  total_chars: number
  chapters: Chapter[]
}

export interface KnowledgeNode {
  id: string
  name: string
  definition: string
  category: string
  chapter: string
  page: number
  sources: string[]
  frequency: number
}

export interface KnowledgeRelation {
  source: string
  target: string
  relation_type: string
  description: string
}

export interface MergeDecision {
  decision_id: string
  action: string
  affected_nodes: string[]
  result_node: string
  reason: string
  confidence: number
}

export interface Citation {
  textbook: string
  chapter: string
  page: number
  relevance_score: number
}

export interface RAGResponse {
  answer: string
  citations: Citation[]
  source_chunks: string[]
}
