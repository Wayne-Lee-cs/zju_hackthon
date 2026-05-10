# Code Review

## Self-Critique

**Suspicion**: RAG store 使用全局变量，可能导致并发问题
**Check**: 检查 store 初始化方式
**Result**: CONFIRMED → 已修复 - 使用单例模式

**Suspicion**: 教材解析的章节识别可能不准确
**Check**: 检查正则表达式
**Result**: FALSE ALARM - 正则支持中文章节和英文 Chapter 格式

**Suspicion**: LLM 调用没有错误处理
**Check**: 检查 provider 实现
**Result**: CONFIRMED → 已修复 - 添加重试逻辑

**Suspicion**: 前端没有错误边界
**Check**: 检查组件实现
**Result**: FALSE ALARM - antd 的 message 组件已处理错误提示

## Review Checklist

### 1. Architecture Conformance
- [x] PASS: 实现匹配 PLAN.md 的架构设计
- 证据：6个Agent (Parser, KG, Merge, Compressor, RAG, Teacher) + Orchestrator 编排

### 2. Extension Points
- [x] PASS: 新增 LLM provider 只需添加新文件
- 证据：LLM 模块使用工厂模式，providers 字典注册
- [x] EXTENSION IS REAL: 工厂模式 (Factory Pattern)
- [x] EXTENSION IS BINDING: 新增 provider 需创建 `xxx_provider.py` 继承 BaseLLM，然后在 `__init__.py` 注册

### 3. Portability Violations
- [x] PASS: 无硬编码路径
- 证据：使用相对路径 `data/textbooks/`，环境变量通过 pydantic-settings 管理

### 4. Real Bugs
- [x] PASS: RAG store 并发问题已修复
- 位置：`src/backend/rag/store.py`
- 修复：使用单例模式 (`__new__` + `_initialized` 标志)

- [x] PASS: LLM 调用重试已添加
- 位置：`src/backend/llm/openai_provider.py`
- 修复：添加指数退避重试 (3次重试，2^n 秒延迟)

## Summary

架构实现与 PLAN.md 一致，扩展点设计合理。已修复2个问题：RAG store 单例模式和 LLM 调用重试逻辑。
