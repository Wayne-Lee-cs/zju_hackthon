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
4

## 完成条件
1. 赛题要求全部检查完毕
2. SPEC 文档存在 ✅
3. 代码和 SPEC 对齐 (部分完成)
4. 无已知 bug

## 进度记录

### 迭代1: 初始检查
- 发现目录结构符合要求（frontend/, backend/, shared/, docs/）

### 迭代2: 赛题对照分析
- 生成 SPEC.md ✅
- REVIEW.md 已更新（8项漏洞，4个P0）

### 迭代3: 已修复项确认
- upload.py 修复 ✅
- 前端 TS 编译通过 ✅

### 迭代4: TeacherAgent 分析

#### 问题诊断
TeacherAgent.execute 只用 MergeDecision 上下文，没有用 RAG 检索真实内容
teacher_chat → TeacherAgent.execute → 只看 decisions，不看图谱内容

#### 修复方案
需要将 RAG retrieval 集成到 TeacherAgent，让它能基于知识图谱内容回答

#### 决定
继续修复 TeacherAgent 集成问题

### 迭代5: 修复 TeacherAgent

实际问题是 TeacherAgent 没有 RAG 上下文。需要增强它以支持基于知识图谱的问答。

#### 完成项
- upload.py 调用 KGAgent ✅
- SPEC.md 生成 ✅

#### 待修复
1. TeacherAgent 需要 RAG 检索能力
2. 图谱持久化缺失
3. ParserAgent 空壳