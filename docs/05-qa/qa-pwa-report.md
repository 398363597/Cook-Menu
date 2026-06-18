# Cook_Menu PWA 专项回归测试报告

测试日期：2026-06-18

## 1. 测试环境和启动命令

- 项目目录：`D:\CodeX\Cook-Menu`
- 操作系统：Windows 10/11 兼容环境
- 浏览器：Google Chrome `149.0.7827.115`，Playwright 无头模式
- 移动端视口：`390 x 844`
- 测试地址：`http://127.0.0.1:8873/index.html`
- 启动命令：`python -m http.server 8873 -b 127.0.0.1`
- 隔离方式：使用全新 Chrome 用户数据目录 `cook-menu-pwa-qa-1781749910233` 和全新端口 origin；启动前无该 origin 的 localStorage、HTTP 缓存或 Service Worker。
- 测试方式：先在线首次打开并等待 Service Worker 就绪，再停止 HTTP 服务模拟断网刷新，之后恢复服务并执行核心功能回归。

## 2. PWA 静态安装条件

结论：通过。

- `/`、`index.html`、`manifest.webmanifest`、`service-worker.js`、三枚图标均通过 HTTP 返回 `200`，无 404。
- Content-Type 正确：HTML 为 `text/html`，manifest 为 `application/manifest+json`，Service Worker 为 `text/javascript`，图标为 `image/png`。
- manifest JSON 可正常解析；Chrome `Page.getAppManifest` 返回 0 条 manifest 错误，`Page.getInstallabilityErrors` 返回 0 条安装性错误。
- 关键字段合理：`name`/`short_name` 为 `Cook_Menu`，`start_url` 为 `./index.html`，`scope` 为 `./`，`display` 为 `standalone`，主题色 `#FF6B35`，背景色 `#F8F9FA`。
- 图标真实解码通过：`icon-192.png` 为 192x192，`icon-512.png` 为 512x512，`icon-maskable-512.png` 为 512x512。
- maskable 图标主体位于中心安全区域，四周有足够背景延展，未发现明显裁切风险。
- 页面存在必要链接：[index.html](D:\CodeX\Cook-Menu\index.html:7) 包含 `theme-color`，[index.html](D:\CodeX\Cook-Menu\index.html:9) 包含 manifest，[index.html](D:\CodeX\Cook-Menu\index.html:10) 至 11 行包含普通图标与 Apple Touch 图标。

## 3. Service Worker 生命周期

结论：通过。

- 首次在线访问后注册成功，脚本 URL 为 `http://127.0.0.1:8873/service-worker.js`。
- 注册 scope 为 `http://127.0.0.1:8873/`，与 manifest scope 一致。
- `navigator.serviceWorker.ready` 成功返回；active worker 状态为 `activated`。
- 当前页面 `navigator.serviceWorker.controller` 非空，页面已受控。
- 新开 `start_url` 页面同样被控制，标题为 `Cook_Menu`，正文非空，无跳转错误或空白页。
- `skipWaiting()` 与 `clients.claim()` 生效路径存在，见 [service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:15) 和 [service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:24)。

## 4. 缓存与离线回归

结论：离线能力通过；更新策略存在 1 项中优先级风险。

- 已建立缓存 `cook-menu-pwa-v1`。
- 缓存包含 `/`、`index.html`、manifest、192/512/maskable 三枚图标，应用壳资源完整。
- 首次在线打开后停止 HTTP 服务，再刷新 `index.html`：页面返回 200、标题和核心界面正常、Service Worker 继续控制页面、无水平溢出。
- 离线阶段记录到 1 次 `index.html` 的 `net::ERR_CONNECTION_REFUSED`，这是模拟断网产生的预期底层网络失败；Service Worker 随后从缓存成功响应，不构成功能缺陷。
- 在线阶段控制台错误、Service Worker 错误、请求失败均为 0。

## 5. 移动端视觉结果

结论：通过。

- 390x844 视口下，`scrollWidth === clientWidth === 390`，无水平溢出。
- 新增表单保存栏矩形为 `x=12, y=720, width=366, height=52`。
- 底部导航矩形为 `x=0, y=772, width=390, height=72`。
- 保存栏底部与底部导航顶部均为 `772`，二者相邻、不重叠，按钮可用。

## 6. 核心功能回归

结论：通过。

- 空库：全新 origin 首屏显示“还没有菜谱”，未生成样例数据。
- 新增：新增 `PWA 回归蒸蛋` 成功，分类为快手菜。
- 无调料：只填写菜名、食材和步骤可保存；存储中 `seasonings.length === 0`，详情显示“还没有记录调料”。
- 刷新保留：刷新后菜谱仍存在，详情内容未丢失。
- 搜索：搜索食材“鸡蛋”可命中菜谱。
- 分类：选择“快手菜”可命中；切换“家常菜”正确排除。
- 编辑：将下次改进改为“下次少放水并加盖”后保存，详情正确展示。
- 删除：删除前出现确认框；确认后 `recipes.length === 0` 并返回空状态。

## 7. 问题清单

### P2 中优先级：固定缓存版本可能让已安装用户长期使用旧应用壳

- 位置：[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:1)、[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:31)、[deploy-android-pwa.md](D:\CodeX\Cook-Menu\docs\04-development\deploy-android-pwa.md:70)
- 前置条件：用户已访问或安装当前 PWA，`cook-menu-pwa-v1` 已缓存 `index.html`。
- 复现步骤：
  1. 保持 `service-worker.js` 内容及 `CACHE_NAME` 不变。
  2. 仅部署新版 `index.html` 或 `manifest.webmanifest`。
  3. 已安装用户重新打开或刷新应用。
- 预期：用户在合理时间内获取新版应用壳。
- 实际：fetch 使用 cache-first，旧 `index.html`/manifest 命中后直接返回；若 Service Worker 字节未变化，不会触发新的 install，旧缓存没有自动失效机制，可能持续使用旧壳。
- 证据：`CACHE_NAME` 固定为 `cook-menu-pwa-v1`；[service-worker.js](D:\CodeX\Cook-Menu\service-worker.js:31) 优先执行 `caches.match()`；部署文档仅在“缓存策略有大变化”时建议改版本号，而不是要求每次应用壳发布都更新版本。
- 影响：不影响首次安装和本轮离线使用，但会影响后续缺陷修复、功能更新到达已安装用户。
- 交回开发 Agent 的修复项：建立每次发布自动变化的缓存版本；或对导航请求采用 network-first / stale-while-revalidate 并配合更新提示；同步修正文档，明确每次应用壳变更必须更新 Service Worker 或缓存版本。

未发现 P0/P1 高优先级缺陷。

## 8. 是否可进入 HTTPS 部署和安卓真机安装

结论：可以进入 HTTPS 部署和安卓真机安装验证，但建议在正式持续发布前修复上述 P2 更新策略。

- 静态安装条件通过，Chrome 安装性检查为 0 错误。
- Service Worker 注册、激活、控制、缓存及离线刷新均通过。
- `start_url` 与 `scope` 正确，核心闭环未被 PWA 改造破坏。
- 本轮环境不能真实触发 Android 系统安装提示，也未完成真机桌面图标启动；因此这里确认的是“静态安装条件和桌面 Chrome PWA 运行条件通过”，不是“安卓真机安装已完成”。

## 9. 真机仍需验证的项目

- Android Chrome 是否出现“安装应用/添加到主屏幕”入口。
- 安装后桌面图标、名称、maskable 裁切效果是否正常。
- 从桌面图标启动后是否为 standalone 模式，是否进入正确 start_url。
- Android 状态栏主题色、启动背景色及竖屏方向是否符合预期。
- 真机断网、杀进程、重启手机后离线启动是否稳定。
- 真机 Chrome 更新 Service Worker 后，新应用壳能否及时到达；重点回归本报告 P2 问题。
- 清理浏览器数据、卸载重装后的本地菜谱数据行为是否符合用户预期。
- 不同 Android 厂商系统的安装入口、图标裁切与底部安全区适配。
