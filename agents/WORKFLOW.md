# Cook_Menu Agent 工作台

这是所有 Agent 共享的项目状态账本。每个 Agent 开始工作前必须先读本文件，并根据“当前任务”判断是否轮到自己。聊天记录不是项目状态来源；任务状态、交接产物和下一责任人以本文件为准。

## Agent 注册表

| Agent ID | 角色 | 角色卡 | 固定产物 | 当前状态 |
|---|---|---|---|---|
| `019ed61f-f289-7ee1-9d8e-c3aa41e1b12f` | 功能规划 Agent | `agents/01-mvp-planner-agent.md` | `docs/01-mvp-planner/` | 待命 |
| `019ed627-4c67-75a3-853a-729d5025b40b` | 数据模型 Agent | `agents/02-data-model-agent.md` | `docs/02-data-model/` | 待命 |
| `019ed62b-a71a-7a13-9d86-d38d1a419bb8` | UI 设计 Agent | `agents/03-ui-design-agent.md` | `docs/03-ui-design/`、`designs/personal-recipe-ui.html` | 待命 |
| `019ed641-62a2-7e91-9cc6-2ac4787b1c75` | 开发 Agent | `agents/04-local-app-builder-agent.md` | 应用代码、`docs/04-development/` | 待命 |
| `019ed669-3409-7bb1-9b87-d290d1ff9b2d` | QA Agent | `agents/05-qa-agent.md` | `docs/05-qa/` | 待命 |

## 状态定义

| 状态 | 含义 |
|---|---|
| 待办 | 已明确责任人，尚未开始 |
| 已派发 | 调度器已经唤醒责任 Agent，等待其接单 |
| 进行中 | 责任 Agent 已接单并正在执行 |
| 阻塞 | 缺少输入或需要用户决定，必须写明原因 |
| 待验收 | 开发或设计已完成，等待下一责任人检查 |
| 已完成 | 产物已保存、验证完成并登记结果 |
| 已取消 | 用户明确取消或被后续任务取代 |

## 当前任务

Agent 只能执行责任 Agent ID 与自己一致、状态为“待办”“已派发”或“进行中”的任务。若没有匹配任务，应停止执行并回复“当前工作台没有分配给我的任务”。

| 任务 ID | 任务 | 责任 Agent ID | 状态 | 输入 | 预期输出 | 完成结果 | 下一责任人 |
|---|---|---|---|---|---|---|---|

## 已完成记录

| 任务 ID | 角色 | Agent ID | 最终输出 | 结论 | 完成时间 |
|---|---|---|---|---|---|
| `MVP-001` | 功能规划 | `019ed61f-f289-7ee1-9d8e-c3aa41e1b12f` | `docs/01-mvp-planner/mvp.md` | 个人自用 MVP 范围已确认 | 2026-06-17 |
| `DATA-001` | 数据模型 | `019ed627-4c67-75a3-853a-729d5025b40b` | `docs/02-data-model/data-model.md` | 本地优先数据结构已完成 | 2026-06-17 |
| `UI-001` | UI 设计 | `019ed62b-a71a-7a13-9d86-d38d1a419bb8` | `docs/03-ui-design/ui-design.md`、`designs/personal-recipe-ui.html` | 个人版四页面视觉稿已完成 | 2026-06-17 |
| `DEV-001` | 开发 | `019ed641-62a2-7e91-9cc6-2ac4787b1c75` | `index.html`、`docs/04-development/dev-handoff.md` | 本地版核心闭环已实现并完成 QA 缺陷修复 | 2026-06-17 |
| `QA-001` | QA | `019ed669-3409-7bb1-9b87-d290d1ff9b2d` | `docs/05-qa/qa-final-report.md` | 核心功能最终回归通过 | 2026-06-17 |
| `DEV-PWA-001` | PWA 改造 | 主线程协调者 | `manifest.webmanifest`、`service-worker.js`、`assets/icons/`、`docs/04-development/deploy-android-pwa.md` | 已具备 PWA 基础文件 | 2026-06-18 |
| `QA-PWA-001` | QA | `019ed669-3409-7bb1-9b87-d290d1ff9b2d` | `docs/05-qa/qa-pwa-report.md` | 安装条件、离线和核心回归通过；发现 1 项 P2 缓存更新风险 | 2026-06-18 |
| `DEV-PWA-002` | 开发 | `019ed641-62a2-7e91-9cc6-2ac4787b1c75` | `service-worker.js`、`docs/04-development/dev-handoff.md`、`docs/04-development/deploy-android-pwa.md` | 同源资源改为 network-first，升级 v2 缓存并限制离线 HTML 回退范围；开发静态自测通过，待 QA 回归 | 2026-06-18 |
| `QA-PWA-002` | QA | `019ed669-3409-7bb1-9b87-d290d1ff9b2d` | `docs/05-qa/qa-pwa-fix-report.md` | v2 在线更新、旧缓存清理、离线应用壳及回退范围回归通过；原 P2 风险关闭 | 2026-06-18 |

## Agent 操作规则

1. 开工前读取本文件、自己的角色卡和当前任务中的输入文件。
2. 确认任务责任 Agent ID 与自己的线程 ID 一致。
3. 接单时把任务状态从“待办”或“已派发”改为“进行中”，并把注册表中的当前状态改为“工作中”。
4. 只处理该任务，不顺手扩大功能范围。
5. 完成后先把结果写入约定产物，再更新任务的“完成结果”。
6. 将任务状态改为“待验收”或“已完成”，并明确下一责任人。
7. 需要下一 Agent 工作时，在“当前任务”新增一行；不要覆盖历史记录。
8. QA 发现缺陷时新增开发任务；开发修复完成后新增 QA 回归任务。
9. 不允许两个 Agent 同时修改同一任务行。发生冲突时停止并交由主线程协调者处理。
10. 已完成的任务移动到“已完成记录”，保留产物路径和结论。

## 调度说明

工作台负责共享状态，调度自动化定期扫描“待办”任务。调度器发送消息成功后将任务改为“已派发”；责任 Agent 被唤醒后读取本表、接单并改为“进行中”。若自动化不可用，主线程协调者按同一规则手动派发。
