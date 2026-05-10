# 学科知识整合智能体 - 代码审查与改进规范

## 项目概述

**项目名称**: 学科知识整合智能体
**技术栈**: FastAPI + React + NetworkX + ChromaDB + Multi-LLM
**赛题来源**: 第一届AI全栈黑客松
**代码状态**: 功能骨架完成，存在多个关键漏洞

---

## 一、赛题要求对照检查

| 赛题要求 | 实现状态 | 说明 |
|---------|---------|------|
| 多Agent架构 (Parser/KG/Merge/Compressor/RAG/Teacher) | ⚠️ 部分实现 | Orchestrator存在但upload流程未调用KG |
| 知识图谱构建 (NetworkX) | ⚠️ 存在但未调用 | `knowledge_graph/extractor.py` 写好但未集成 |
| 向量检索 (ChromaDB) | ✅ 已实现 | `rag/store.py` 单例模式 |
| 多LLM后端 | ✅ 配置完善 | OpenAI/Anthropic/Ollama/ModelScope |
| Agent间协作 | ❌ 未实现 | KGAgent/MergeAgent/CompressorAgent 未被调用 |

---

## 二、严重漏洞 (Critical)

### 2.1 上传流程残缺

**问题位置**: `backend/routers/upload.py:34`

**现状**:
```python
textbook = await parser.execute(file_path, safe_name)  # 只调用了Parser
books_db[textbook.textbook_id] = textbook
# 缺失: KG构建 → Merge合并 → Compress压缩 全流程
```

**应有的流程**:
```
上传文件 → Parser解析 → KG提取知识点 → Merge合并图谱 → Compress压缩 → RAG存储
```

**影响**: 用户上传教材后，知识图谱不会自动构建，整个核心功能形同虚设。

---

### 2.2 ParserAgent 是空壳实现

**问题位置**: `backend/agents/parser_agent.py`

**现状**:
```python
async def execute(self, file_path: str, filename: str) -> Textbook:
    return load_textbook(file_path, filename)  # 只是文件读取
```

**问题**: 只是调用同步loader读文件，没有LLM参与章节内容理解、结构化解析、知识点初筛。

**应有行为**: 应该用LLM分析教材结构，识别章节目录、提取关键概念、生成摘要。

---

### 2.3 KGAgent 提取的图谱从未被使用

**问题位置**: `backend/agents/kg_agent.py` vs `backend/routers/upload.py`

**现状**: `KGAgent.execute()` 返回图谱数据，但 `upload.py` 完全没有调用它。

**应有的数据流**:
```python
# upload.py 中应改为:
textbook = await parser.execute(file_path, safe_name)
graph = await kg_agent.execute(textbook)  # 提取知识图谱
merged, decisions = await merge_agent.execute([graph])
compressed = await compressor.execute(merged, textbook)
store.save_graph(compressed)  # 持久化
```

---

### 2.4 CompressStats.tsx TypeScript 编译错误

**问题位置**: `frontend/src/components/CompressStats.tsx:2`

**编译错误**:
```
error TS6133: 'Card' is declared but its value is never read
error TS6133: 'Statistic' is declared but its value is never read
```

**原因**: TypeScript 严格模式检测到未使用的导入。需从 import 语句中删除。

---

## 三、安全漏洞 (Security)

### 3.1 路径遍历风险

**位置**: `backend/routers/upload.py:28-29`

```python
safe_name = os.path.basename(file.filename)  # 攻击: "../../../etc/passwd"
file_path = f"data/textbooks/{safe_name}"
os.makedirs(os.path.dirname(file_path), exist_ok=True)
with open(file_path, "wb") as f:  # 写入位置未验证在 data/ 内
```

**修复方案**: 使用 `pathlib` 验证最终路径在 `data/textbooks/` 内:
```python
from pathlib import Path
base = Path("data/textbooks").resolve()
dest = (base / safe_name).resolve()
if not dest.is_relative_to(base):
    raise HTTPException(400, "非法文件路径")
```

---

### 3.2 API Key 配置缺失

**位置**: `backend/config.py:6-7`

```python
LLM_API_KEY: str = ""  # 默认空字符串
```

**问题**: 当 `.env` 文件不存在或 `API_KEY` 未配置时，系统会以空 key 运行，所有LLM调用失败。

**修复方案**:
```python
LLM_API_KEY: str = Field(default="", description="LLM API Key")
# 或在启动时检查:
if not settings.LLM_API_KEY:
    raise RuntimeError("LLM_API_KEY must be set in .env")
```

---

### 3.3 CORS 配置不当

**位置**: `backend/main.py:21-27`

```python
allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
```

**问题**: 硬编码的localhost地址，生产环境无法使用。

**修复方案**: 从环境变量读取或使用 ModelScope 允许的域。

---

## 四、架构缺陷 (Architecture)

### 4.1 ChromaStore 单例并发问题

**位置**: `backend/rag/store.py:8-14`

```python
class ChromaStore:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
```

**问题**:
- 多线程/多请求共享同一个 `self.client` 和 `self.model`
- ChromaDB Python client 非线程安全
- `SentenceTransformer` 模型在推理时有状态

**修复方案**: 移除单例，或使用 `threading.local` 为每个请求创建独立实例。

---

### 4.2 同步 Loaders 阻塞事件循环

**位置**: `backend/loaders/*.py` (全部)

```python
def load_textbook(file_path: str, filename: str) -> Textbook:  # 同步函数
    if ext == '.pdf':
        return load_pdf(file_path)  # pymupdf 同步I/O
```

**问题**: FastAPI async endpoint 中调用同步函数会阻塞事件循环，影响并发性能。

**修复方案**: 将 loaders 改为 `async` 函数，内部使用 `asyncio.to_thread()` 执行同步I/O。

---

### 4.3 图谱未持久化

**问题**: NetworkX 图每次构建后只存在内存中，FastAPI 重启后丢失。

**应有持久化**:
```python
# builder.py 应添加:
def save_graph(graph: nx.DiGraph, path: str):
    nx.write_gml(graph, path)

def load_graph(path: str) -> nx.DiGraph:
    return nx.read_gml(path)
```

---

## 五、可优化项 (Optimization)

### 5.1 Chunk size 配置偏小

**位置**: `backend/config.py:9`
```python
CHUNK_SIZE: int = 600
CHUNK_OVERLAP: int = 80
```

**问题**: 600字符对于复杂知识表示太少，会丢失上下文。

**建议**: CHUNK_SIZE=1200, CHUNK_OVERLAP=150

---

### 5.2 Embedding 模型效果一般

**位置**: `backend/config.py:11`
```python
EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
```

**问题**: MiniLM 是轻量模型，中文语义理解能力有限。

**建议**: 换成 `moka-ai/m3e-base` 或 `BAAI/bge-large-zh-v1.5`

---

### 5.3 缺乏并发处理

**位置**: `backend/routers/upload.py:16-52`

```python
for file in files:
    # 串行处理每个文件
    textbook = await parser.execute(...)
```

**建议**: 使用 `asyncio.gather` 并行处理多文件上传。

---

### 5.4 前端缺少知识图谱可视化

**问题**: 用户看不到知识图谱的结构，只能看到统计数字。

**建议**: 集成 `AntV G6` 或 `D3.js` 绘制交互式知识图谱。

---

## 六、待修复文件清单

| 文件 | 问题 | 优先级 |
|-----|-----|-------|
| `backend/routers/upload.py` | 未调用 KG/Merge/Compress pipeline | P0 |
| `backend/agents/parser_agent.py` | 空壳，无 LLM 解析 | P0 |
| `frontend/src/components/CompressStats.tsx` | TS6133 未使用 import | P0 |
| `backend/rag/store.py` | 单例并发问题 | P1 |
| `backend/loaders/*.py` | 同步阻塞 | P1 |
| `backend/routers/upload.py` | 路径遍历风险 | P1 |
| `backend/config.py` | API Key 无校验 | P1 |
| `backend/main.py` | CORS 配置不当 | P2 |
| `backend/knowledge_graph/merger.py` | 图合并后节点关系未清理 | P2 |
| `backend/knowledge_graph/builder.py` | 缺少图持久化 | P2 |

---

## 七、测试计划建议

### 7.1 单元测试
- `test_loader_pdf.py` - PDF 解析
- `test_kg_extractor.py` - 知识提取
- `test_merger.py` - 图合并逻辑

### 7.2 集成测试
- 上传 PDF → 验证图谱构建 → 验证 RAG 查询

### 7.3 性能测试
- 100 个文件并发上传
- ChromaDB 10k chunk 向量检索延迟

---

## 八、版本兼容性

| 依赖 | 当前版本 | 说明 |
|-----|---------|------|
| Python | 3.10 | ✅ |
| Node | 20-slim | ✅ |
| fastapi | 0.115.12 | ✅ |
| chromadb | 0.6.3 | ✅ |
| pymupdf | 1.25.5 | ✅ |
| networkx | 3.4.2 | ✅ |

---

## 九、部署检查清单

- [ ] `.env` 文件存在且 `API_KEY` 有值
- [ ] `LLM_PROVIDER` 配置为 `modelscope`
- [ ] Docker build 成功 (当前 TS 错误)
- [ ] 前端 dist 构建产物存在
- [ ] ChromaDB 数据目录可写
- [ ] ModelScope 创空间代码已同步 master 分支