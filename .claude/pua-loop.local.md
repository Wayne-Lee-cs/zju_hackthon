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
6

## 完成条件
1. 赛题要求全部检查完毕 ✅
2. SPEC 文档存在 ✅
3. 代码和 SPEC 对齐 (大部分完成)
4. 无已知 bug

## 已修复项 (P0)
- ✅ upload.py 调用 KGAgent (迭代3)
- ✅ TeacherAgent RAG 集成 (迭代5)
- ✅ 图谱持久化 (迭代6)

## 剩余问题
1. P2: ParserAgent 空壳 - 只有loader调用无LLM解析
2. P2: Orchestrator 未使用

## 决定
检查是否可以结束 loop