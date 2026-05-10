# 学科知识整合智能体

基于多Agent架构的学科知识整合系统，支持多格式教材上传、知识图谱构建、跨教材整合、RAG精准问答和教师对话。

## 环境依赖

- Python 3.11+
- Node.js 22+
- 或 Docker + Docker Compose

## 安装步骤

### 方式一：本地安装

```bash
# 后端
pip install -r requirements.txt

# 前端
cd src/frontend
npm install
```

### 方式二：Docker 部署

```bash
docker-compose up -d
```

## 配置说明

复制 `.env.example` 为 `.env`，配置 LLM 相关参数：

```bash
cp .env.example .env
```

支持三种 LLM 后端：
- OpenAI (默认)
- Anthropic
- Ollama (本地部署)

## 启动命令

```bash
# 后端
uvicorn src.backend.main:app --reload

# 前端
cd src/frontend
npm run dev
```

访问 http://localhost:5173

## 使用说明

1. **上传教材**：支持 PDF、DOCX、MD、TXT 格式
2. **构建图谱**：对每本教材生成知识图谱
3. **跨教材整合**：识别重复知识点，生成整合决策
4. **内容压缩**：生成精华版内容，压缩率 ≤30%
5. **RAG问答**：基于教材内容精准回答，带引用标注
6. **教师对话**：支持查询和修改整合决策

## 功能特性

- 多格式教材解析 (PDF/DOCX/MD/TXT)
- LLM驱动的知识点提取
- ECharts力导向图可视化
- 双重语义对齐 (Embedding + LLM)
- RAG精准问答 (带引用)
- 教师对话 (支持修改决策)
