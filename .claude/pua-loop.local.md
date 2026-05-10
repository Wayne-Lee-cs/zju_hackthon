---
name: pua-loop
description: 对照赛题检查项目完整性并优化
type: loop
active: true
session_id:
max_iterations: 30
completion_promise: "LOOP_DONE"
task: "对照赛题看看现在的文件夹里是否还缺什么东西，下一步能如何优化"
---

# PUA Loop 状态文件

## 任务
对照赛题检查项目完整性并优化

## PUA 行为协议
- 禁止 AskUserQuestion
- 禁止说"无法解决"
- 穷尽一切才能退出
- 每次迭代: 检查 → 验证 → 发现问题 → 修复 → 再验证

## 当前迭代
5

## 完成条件
1. 赛题要求全部检查完毕 ✅
2. SPEC 文档存在 ✅
3. 代码和 SPEC 对齐 (大部分完成)
4. 无已知 bug

## 进度记录

### 迭代1: 初始检查
- 目录结构完整

### 迭代2: SPEC 生成
- SPEC.md 生成 ✅

### 迭代3-4: upload.py 修复
- KGAgent 调用 ✅
- 路径遍历防护 ✅

### 迭代5: TeacherAgent RAG 集成 ✅
- 现在 TeacherAgent.execute 调用 retrieve() 获取 RAG 上下文
- 返回 citations 用于溯源
- 角色从"教师审查决策"改为"学习者知识问答"

### 迭代6: 图谱持久化 (P1)

#### 问题
NetworkX 图谱只存内存，FastAPI 重启后丢失

#### 修复方案
在 knowledge_graph/builder.py 添加 save/load 方法

#### 当前状态
继续处理下一个问题

### 待修复 (按优先级)
1. P1: 图谱持久化 - builder.save_graph / load_graph
2. P2: ParserAgent LLM 解析增强
3. P2: Orchestrator 替代 upload.py 手写流程

## 决定
继续迭代，处理图谱持久化问题