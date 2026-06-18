# Cook_Menu PWA 缓存修复回归报告

测试日期：2026-06-18  
任务 ID：`QA-PWA-002`

## 1. 测试环境

- 项目目录：`D:\CodeX\Cook-Menu`
- 浏览器：Google Chrome `149.0.7827.115`，Playwright 隔离实例
- 浏览器视口：`390 x 844`
- 全新用户数据目录：`cook-menu-pwa-fix-1781761309140`
- HTTP 地址：`http://127.0.0.1:8874/`
- 启动命令：`python -m http.server 8874 -b 127.0.0.1`
- 输入文件：`service-worker.js`、`docs/04-development/dev-handoff.md`、`docs/05-qa/qa-pwa-report.md`
- 隔离原则：使用全新 origin 和浏览器配置；无历史 localStorage、HTTP 缓存或 Service Worker 污染。
- QA 未修改应用代码。在线更新测试通过向浏览器 Cache Storage 注入带唯一标记的旧响应完成，不改动 `index.html`。

## 2. 回归结论

`DEV-PWA-002` 修复通过。

- `cook-menu-pwa-v2` 正常安装、激活并控制页面。
- 激活阶段成功删除预先注入的 `cook-menu-pwa-v1` 旧缓存。
- 在线刷新优先取得网络最新应用壳，并同步覆盖 v2 中的旧缓存内容。
- 离线刷新继续打开核心页面，本地菜谱数据不丢失。
- 离线未缓存非导航资源不会错误返回 HTML。
- 离线未缓存导航请求正确回退到 `index.html`。
- PWA 安装性、移动端布局和核心菜谱闭环未发生回归。

原 `QA-PWA-001` 的 P2“固定缓存版本可能让用户长期使用旧应用壳”已关闭。

## 3. Service Worker 生命周期与旧缓存清理

结果：通过。

1. 在首次载入应用前，向同一 origin 人工创建 `cook-menu-pwa-v1`，其中放入带 `STALE-V1-SHELL` 标记的旧首页。
2. 打开当前应用并等待 `navigator.serviceWorker.ready`。
3. 实测 active worker 状态为 `activated`，controller 指向 `/service-worker.js`，scope 为 `/`。
4. Cache Storage 最终仅剩 `cook-menu-pwa-v2`，`cook-menu-pwa-v1` 已删除。
5. v2 缓存包含 `/`、`index.html`、manifest、192/512/maskable 三枚图标。
6. 页面标题为 `Cook_Menu`，未出现旧壳标记。

对应实现位置：

- 缓存版本：[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:1)
- 安装预缓存与 `cache: reload`：[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:11)
- 激活清理旧缓存：[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:20)
- 立即接管页面：[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:26)

## 4. 在线更新回归

结果：通过。

测试步骤：

1. 保持服务器在线，确认 v2 已激活。
2. 直接把 v2 缓存中的当前 `index.html` 替换为带 `QA-STALE-CACHE-MARKER` 的伪造旧页面。
3. 刷新当前页面。
4. 再读取页面 DOM 与 v2 缓存中的 `index.html`。

实际结果：

- 注入后缓存能读到旧标记，证明前置条件成立。
- 刷新后的页面标题为 `Cook_Menu`，展示“我的菜谱”，未展示旧标记。
- 刷新后的 v2 缓存不再包含旧标记，并已写回真实应用 HTML。
- 证明同源 GET 的 network-first 路径确实绕过旧缓存，并在网络成功后更新缓存。

## 5. 离线与回退范围

结果：通过。

### 5.1 离线应用壳

- 在线打开并缓存应用后停止 HTTP 服务。
- 刷新 `index.html` 返回 200，标题、界面和菜谱详情正常显示。
- 页面仍被 Service Worker 控制。
- 已保存菜谱仍存在，`localStorage` 中 `recipes.length === 1`。

### 5.2 未缓存非导航资源

- 离线请求 `/qa-never-cached.png`。
- fetch 以 `TypeError: Failed to fetch` 失败。
- 未返回 `text/html`，修复了旧实现会把首页 HTML 塞给图片请求的问题。

### 5.3 未缓存导航请求

- 离线访问 `/offline-route-not-cached`。
- 返回状态 200、Content-Type 为 `text/html`，标题为 `Cook_Menu`，核心页面正常显示。
- 证明仅导航请求会回退到缓存的 `index.html`。

## 6. PWA 与核心功能回归

结果：通过。

- `service-worker.js` 通过 Node 语法检查。
- index、manifest、Service Worker 和三枚图标经 HTTP 均返回 200，Content-Type 正确。
- Chrome manifest 解析错误为 0，installability errors 为 0。
- 390x844 下无水平溢出。
- 空库状态正常。
- 新增无调料菜谱 `PWA v2 回归蒸蛋` 成功，`seasonings.length === 0`。
- 刷新及离线刷新后菜谱保留。
- 搜索食材“鸡蛋”命中。
- 快手菜筛选命中，家常菜筛选正确排除。
- 编辑“下次改进”成功。
- 删除前出现确认框，确认后恢复空库。

## 7. 错误与请求记录

- 独立在线复核：无 4xx/5xx、无请求失败、无控制台 warning/error。
- Service Worker 运行期间未记录注册、安装、激活或 fetch handler 异常。
- 离线测试中的 `/qa-never-cached.png` `net::ERR_FAILED` 为预期结果，用于证明非导航资源不再回退 HTML。
- 首次用 manifest JSON 页面预置旧缓存时出现的 favicon 404 属于测试准备页面请求；重新从正式 `index.html` 独立在线复核时未复现，不记为应用缺陷。

## 8. 问题清单

本轮未发现 P0、P1、P2 或 P3 新缺陷。

无需新增开发修复任务。

## 9. 发布建议

建议通过 `QA-PWA-002`，可以进入 HTTPS 部署和 Android 真机安装回归。

仍需在真机验证：安装提示、桌面图标与 maskable 裁切、standalone 启动、系统杀进程后的离线启动，以及真实 HTTPS 部署后的跨版本更新到达速度。
