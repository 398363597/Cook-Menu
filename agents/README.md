# Cook_Menu Agents

这个目录存放 Cook_Menu 个人菜谱 App 的 5 个协作 Agent 说明。它们不是运行时代码，而是可复用的工作协议：每个 Agent 读取指定上游产物、只处理自己的职责，并把结果保存到约定文件，供下一个 Agent 继续工作。

## 项目定位

Cook_Menu 是个人自用菜谱 App，不做社区、点赞、评论、关注、粉丝、运营增长和复杂账号系统。

第一版核心目标：

- 记录一道菜需要的食材和调料
- 记录做菜步骤
- 支持菜谱图片
- 食材和调料分开管理
- 记录失败经验和下次改进
- 支持分类筛选，例如早餐、家常菜、快手菜、汤粥、面食
- 本地优先存储，先保证自己手机上好用

## Agent 顺序

1. `01-mvp-planner-agent.md`：确认第一版 MVP 范围
2. `02-data-model-agent.md`：设计数据结构
3. `03-ui-design-agent.md`：重画个人版 UI，去掉社区化内容
4. `04-local-app-builder-agent.md`：实现本地存储版本
5. `05-qa-agent.md`：验收新增、编辑、删除、图片、搜索等流程

## 固定交接文件

所有 Agent 首先读取 `agents/WORKFLOW.md`。该文件登记 Agent ID、任务状态、最终产物和下一责任人，是项目协同的唯一状态账本。

- 功能规划 Agent：读取用户需求，维护 `docs/01-mvp-planner/mvp.md`
- 数据模型 Agent：读取 MVP，维护 `docs/02-data-model/data-model.md`
- UI 设计 Agent：读取 MVP 和数据模型，维护 `docs/03-ui-design/ui-design.md` 和 `designs/personal-recipe-ui.html`
- 开发 Agent：读取前三阶段文档和视觉稿，维护应用代码及 `docs/04-development/`
- QA Agent：读取需求、模型、设计和开发交接，维护 `docs/05-qa/` 下的报告和截图

文档是跨线程的唯一交接依据。聊天回复只能总结结果，不能代替写入交接文件。

## 接单规则

1. Agent 被唤醒后先读取 `agents/WORKFLOW.md`。
2. 只有“当前任务”中责任 Agent ID 等于自己的线程 ID，并且状态为“待办”“已派发”或“进行中”时才能开工。
3. 开工、完成、阻塞和交接都必须回写工作台。
4. 没有分配给自己的任务时不得自行修改项目。
5. 调度自动化负责扫描“待办”并唤醒责任线程；自动化不可用时由主线程协调者手动派发。

## 推荐使用方式

每次只让一个 Agent 做它自己的阶段。Agent 开始前先读取上游文件，完成后写入自己的固定产物，不依赖其他线程的聊天上下文。

建议交接产物：

- MVP Agent 输出：功能范围、页面列表、第一版不做什么
- 数据 Agent 输出：数据模型、字段说明、示例 JSON
- UI Agent 输出：页面布局、组件状态、表单结构
- 开发 Agent 输出：可运行代码、存储逻辑、运行方式
- QA Agent 输出：问题清单、验收结果、修复建议

## 缺陷闭环

```text
QA 发现问题并写报告
  -> 开发 Agent 根据报告修复并更新 dev-handoff.md
  -> QA Agent 只做回归验证
  -> 未通过则再次交回开发 Agent
  -> 全部通过后写 qa-final-report.md
```

- QA Agent 不直接修改应用代码。
- 开发 Agent 不代替 QA 给出最终验收结论。
- UI Agent 不修改正式应用代码；视觉稿确认后再交给开发 Agent 集成。
- 需求或数据结构改变时，先更新对应上游文档，再继续开发。

## 总控提示词

如果你想让一个主 agent 负责协调，可以使用：

```text
你是 Cook_Menu 项目的总控 Agent。
项目是个人自用菜谱 App，不做社区化功能。
请按 agents/README.md 中的顺序推进：MVP 规划、数据模型、UI 设计、本地应用实现、测试验收。
每个阶段只接受对应 Agent 的产物，避免扩大范围。所有产物必须保存到 agents/README.md 约定的路径。
QA 只报告问题，开发负责修复，QA 再回归，直到 `docs/05-qa/qa-final-report.md` 给出通过结论。
核心需求必须保留：图片、食材调料分开、失败经验/下次改进。
```
