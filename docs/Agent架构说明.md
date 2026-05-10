# Agent 架构说明

## 架构总览

系统采用多Agent架构，包含6个专职Agent：

1. **ParserAgent**：文档解析，将多格式教材转为统一结构
2. **KGAgent**：知识图谱构建，提取知识点和关系
3. **MergeAgent**：跨教材整合，语义对齐和决策生成
4. **CompressorAgent**：内容压缩，生成精华版
5. **RAGAgent**：RAG问答，带引用的精准回答
6. **TeacherAgent**：教师对话，支持查询和修改决策

OrchestratorAgent 负责编排上述Agent的工作流。

## 设计决策

### 为什么选多Agent

- **职责单一**：每个Agent有独立prompt和上下文，避免单Agent的prompt过长
- **可扩展性**：新增功能只需添加新Agent
- **可测试性**：每个Agent可独立测试

### 替代方案：单Agent

优点：实现简单，上下文连贯
缺点：prompt过长，难以维护，扩展性差

## 数据流

```
用户上传 → ParserAgent → KGAgent → MergeAgent → CompressorAgent
                ↓              ↓          ↓
            RAG Indexer    图谱构建    整合决策
                ↓
            RAGAgent → 用户
```

## RAG Pipeline 设计

### 分块策略

- 分块大小：600字
- 重叠大小：80字
- 理由：平衡精度和效率，符合赛题要求

### Embedding 选型

- 模型：paraphrase-multilingual-MiniLM-L12-v2
- 理由：支持中文，赛题建议，轻量高效

## Prompt 工程

- **Few-shot**：提供示例输出格式
- **JSON格式约束**：强制结构化输出
- **防幻觉**：只基于上下文回答，不用自身知识

## 取舍与权衡

| 决策 | 选择 | 权衡 |
|------|------|------|
| 图谱存储 | NetworkX | 轻量但不适合大规模 |
| 向量库 | ChromaDB | 简单但功能有限 |
| 对齐策略 | Embedding+LLM | 准确但成本较高 |

## 已知局限

- 单机部署，不支持分布式
- NetworkX 不适合超大规模图谱
- LLM 调用成本较高

## 创新点

1. **双重语义对齐**：Embedding粗筛+LLM精判，平衡准确度和成本
2. **教师对话**：支持自然语言修改整合决策
3. **压缩率控制**：确保精华版 ≤30%
