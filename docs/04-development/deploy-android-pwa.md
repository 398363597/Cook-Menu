# Cook_Menu 安卓 PWA 部署说明

## 当前状态

项目已经支持 PWA 安装：

- `manifest.webmanifest`
- `service-worker.js`
- `assets/icons/icon-192.png`
- `assets/icons/icon-512.png`
- `assets/icons/icon-maskable-512.png`
- `index.html` 已接入 manifest、theme color、图标和 service worker 注册

正式发布地址：

- GitHub 仓库：`https://github.com/398363597/Cook-Menu`
- PWA 地址：`https://398363597.github.io/Cook-Menu/`
- 发布分支：`main`
- 首个稳定标签：`v1.0.0`

## 本地预览

在项目目录运行：

```powershell
python -m http.server 8767 -b 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8767/
```

注意：直接双击 `index.html` 可以使用 App，但 service worker 和安装能力需要通过 `localhost` 或 HTTPS 才能完整工作。

## 部署到安卓手机

在安卓 Chrome 中打开：

```text
https://398363597.github.io/Cook-Menu/
```

然后：

```text
右上角菜单 -> 安装应用（或“添加到主屏幕”）-> 安装
```

安装后，Cook_Menu 会像普通 App 一样出现在桌面。

## 数据说明

当前菜谱数据保存在浏览器本地：

```text
localStorage key: cook_menu:v1:snapshot
```

这意味着：

- 同一台手机、同一个浏览器可以持续保存。
- 清除浏览器数据会删除菜谱。
- 换手机或换浏览器不会自动同步。
- 建议定期在“我的”页导出 JSON 备份。

## 更新 App

修改 `index.html`、`manifest.webmanifest` 或 `service-worker.js` 后重新部署即可。当前 Service Worker 对同源应用资源采用 network-first：设备在线重新打开或刷新时会取得并缓存最新版本，离线时使用上次成功缓存的版本。

如果用户手机上缓存没有立刻更新，可以：

1. 关闭已安装的 Cook_Menu。
2. 用 Chrome 打开部署网址并刷新。
3. 重新打开桌面图标。

每次修改 Service Worker 的预缓存清单或缓存结构时，应同步修改 `service-worker.js` 里的缓存版本：

```js
const CACHE_NAME = "cook-menu-pwa-v2";
```

例如下一次结构变更时改为 `cook-menu-pwa-v3`，激活后会清理旧版本缓存。只修改 `index.html` 或 manifest 时不必为刷新在线内容单独升级缓存名，但仍应重新部署所有变更文件。
