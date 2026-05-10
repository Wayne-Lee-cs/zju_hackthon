# 学科知识整合智能体 - SPEC

## 1. 项目概述

**项目名称**: 学科知识整合智能体 (Knowledge Integration Agent)
**赛题**: 第一届AI全栈黑客松
**核心功能**: 解析教材、构建知识图谱、智能问答
**目标用户**: 学习者、教师、教育机构

## 2. 技术架构

### 2.1 系统架构图

```
用户 ──► 前端 (React) ──► FastAPI (后端)
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ParserAgent           KGAgent                TeacherAgent
        │                      │                      │
   文件解析              知识图谱                  问答引擎
        │                      │                      │
   Loader (PDF/DOCX)     NetworkX                RAG检索
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                         ChromaDB
```

### 2.2 Agent 职责

| Agent | 职责 | 状态 |
|-------|------|------|
| ParserAgent | 解析教材文件，提取章节结构 | ⚠️ 空壳（直接调用loader） |
| KGAgent | 从章节内容提取知识点和关系 | ✅ 已集成 |
| MergeAgent | 合并多个教材的图谱 | ✅ 已集成 |
| CompressorAgent | 压缩合并后的图谱 | ✅ 已集成 |
| RAGAgent | 检索增强生成 | ✅ 已实现 |
| TeacherAgent | 回答用户问题，基于知识图谱 | ⚠️ 未对接 |
| Orchestrator | 编排多Agent协作 | ⚠️ 未被使用 |

### 2.3 LLM 后端支持

| Provider | 模型 | 用途 |
|---------|-----|------|
| OpenAI | GPT-4/GPT-3.5 | 通用对话 |
| Anthropic | Claude-3 | 通用对话 |
| Ollama | 本地模型 | 离线运行 |
| ModelScope | Qwen2.5-7B | **当前使用** |

## 3. 功能模块

### 3.1 教材上传与解析

**API**: `POST /api/upload`

**流程**:
1. 接收 PDF/DOCX/MD/TXT 文件
2. ParserAgent 解析文件结构
3. KGAgent 提取知识图谱
4. ChromaDB 存储 chunks
5. 返回解析结果（图谱节点数、关系数）

**输入**: `multipart/form-data` (files)

**输出**:
```json
{
  "textbooks": [{
    "textbook_id": "uuid",
    "title": "教材标题",
    "total_chars": 12345,
    "chapters": 5,
    "graph_nodes": 23,
    "graph_relations": 45
  }]
}
```

### 3.2 知识图谱查询

**API**: `GET /api/kg/{book_id}`

**输出**:
```json
{
  "nodes": [{"id": "node_001", "name": "...", "category": "..."}],
  "relations": [{"source": "...", "target": "...", "type": "..."}]
}
```

### 3.3 Teacher 问答

**API**: `POST /api/teacher/ask`

**输入**:
```json
{
  "question": "什么是梯度下降？",
  "book_ids": ["uuid1", "uuid2"]
}
```

**输出**:
```json
{
  "answer": "梯度下降是一种优化算法...",
  "sources": [{"chunk": "...", "score": 0.85}]
}
```

## 4. 前端组件

| 组件 | 路径 | 功能 |
|-----|------|------|
| Layout | `components/Layout.tsx` | 页面布局 |
| FileUpload | `components/FileUpload.tsx` | 教材上传 |
| BookList | `components/BookList.tsx` | 教材列表 |
| KnowledgeGraph | `components/KnowledgeGraph.tsx` | 图谱可视化 |
| MergePanel | `components/MergePanel.tsx` | 合并决策 |
| CompressStats | `components/CompressStats.tsx` | 压缩统计 |
| ChatPanel | `components/ChatPanel.tsx` | Teacher对话 |

**设计风格**: Anthropic 简约风格
- 背景: #FAF9F6 (warm pearl white)
- 强调色: #DA7756 (terracotta)
- 字体: serif (阅读), sans-serif (UI)

## 5. 数据模型

### 5.1 Textbook
```python
textbook_id: str
title: str
filename: str
total_chars: int
chapters: list[Chapter]
```

### 5.2 Chapter
```python
title: str
content: str
page_start: int
page_end: int
```

### 5.3 KnowledgeNode
```python
id: str
name: str
definition: str
category: str  # 核心概念/定理/方法/现象
chapter: str
page: int
sources: list[str]
frequency: int
```

### 5.4 KnowledgeRelation
```python
source: str  # node_id
target: str  # node_id
relation_type: str  # prerequisite/parallel/contains/applies_to
description: str
```

### 5.5 MergeDecision
```python
decision_id: str
action: str  # merge/split/edit
affected_nodes: list[str]
result_node: str
reason: str
confidence: float
```

## 6. 缺失功能清单

| 功能 | 优先级 | 说明 |
|-----|-------|------|
| ParserAgent LLM 解析 | P0 | 当前直接调用 loader，无 LLM 参与 |
| TeacherAgent 集成 | P0 | ChatPanel 存在但未对接后端 |
| Orchestrator 使用 | P1 | 有代码但 upload 时未调用 |
| 图谱持久化 | P1 | NetworkX 图在内存中，重启丢失 |
| 前端图谱可视化 | P1 | KnowledgeGraph 组件为空 |

## 7. 文件结构

```
zju_hackthon/
├── backend/
│   ├── agents/
│   │   ├── parser_agent.py
│   │   ├── kg_agent.py
│   │   ├── merge_agent.py
│   │   ├── compressor_agent.py
│   │   ├── rag_agent.py
│   │   ├── teacher_agent.py
│   │   └── orchestrator.py
│   ├── knowledge_graph/
│   │   ├── builder.py
│   │   ├── extractor.py
│   │   ├── merger.py
│   │   └── serializer.py
│   ├── rag/
│   │   ├── chunker.py
│   │   ├── retriever.py
│   │   └── store.py
│   ├── llm/
│   │   ├── base.py
│   │   ├── openai_provider.py
│   │   ├── anthropic_provider.py
│   │   ├── ollama_provider.py
│   │   └── modelscope_provider.py
│   ├── loaders/
│   │   ├── pdf_loader.py
│   │   ├── docx_loader.py
│   │   ├── md_loader.py
│   │   └── txt_loader.py
│   ├── routers/
│   │   ├── upload.py
│   │   ├── books.py
│   │   ├── kg.py
│   │   ├── merge.py
│   │   ├── rag.py
│   │   ├── teacher.py
│   │   └── tasks.py
│   ├── config.py
│   ├── models.py
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── api/client.ts
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── BookList.tsx
│   │   │   ├── KnowledgeGraph.tsx
│   │   │   ├── MergePanel.tsx
│   │   │   ├── CompressStats.tsx
│   │   │   └── ChatPanel.tsx
│   │   ├── styles/global.css
│   │   └── types/index.ts
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── Agent架构说明.md
│   ├── 接口文档.md
│   ├── 系统设计.md
│   └── 需求分析.md
├── Dockerfile
├── requirements.txt
├── README.md
├── PLAN.md
├── REVIEW.md
└── SPEC.md
```

## 8. 下一步优化方向

1. **P0**: TeacherAgent 对接 ChatPanel
2. **P0**: ParserAgent 加入 LLM 解析
3. **P1**: 图谱持久化 (builder.save_graph)
4. **P1**: 前端 KnowledgeGraph 组件实现可视化
5. **P2**: Orchestrator 替代 upload.py 中的手写流程

## 9. 环境变量

```bash
LLM_PROVIDER=modelscope
LLM_API_KEY=ms-7da6c17d-d634-4cbd-b883-af9a778b1491
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
LLM_BASE_URL=https://api.modelscope.cn/v1
CHUNK_SIZE=1200
CHUNK_OVERLAP=150
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2
```

## 10. 部署

- Docker multi-stage build
- Port: 7860
- ModelScope 创空间部署