# HairSwap 调试工具使用说明

## 📱 用途

移动端（特别是 iOS Safari）调试工具，用于在没有连接 Mac 电脑的情况下查看控制台日志。

---

## 🛠️ 启用调试功能

### 1. 取消 HTML 注释

在 `h5/index.html` 中，找到以下代码并取消注释：

```html
<!-- 取消注释以启用调试功能 -->
<button id="debug-btn"
  style="position:fixed;bottom:5px;left:10px;font-size:10px;padding:2px 6px;background:#f00;color:#fff;border:none;border-radius:4px;z-index:10000;opacity:0.3;">DEBUG</button>
<div id="debug-panel"
  style="display:none;position:fixed;bottom:30px;left:10px;right:10px;max-height:200px;overflow-y:auto;background:#000;color:#0f0;font-size:10px;padding:8px;border-radius:4px;z-index:9999;font-family:monospace;">
</div>
```

### 2. 取消 JavaScript 注释

在 `h5/js/app.js` 中，找到以下代码并取消注释：

```javascript
// 取消注释以启用版本号显示
this.showVersion(); // 显示版本号（调试时使用，平时注释掉）
```

### 3. 上传到服务器

```bash
scp h5/index.html h5/js/app.js root@服务器 IP:/root/HairSwap/h5/
```

---

## 📱 使用方法

### 1. 访问页面

在手机浏览器中访问：
```
http://服务器 IP:8000
```

### 2. 查看调试按钮

启用后，页面会显示：
- **左下角**：红色 `DEBUG` 按钮
- **右下角**：蓝色版本号按钮（如 `v1`）

### 3. 打开调试面板

1. 点击左下角红色 `DEBUG` 按钮
2. 黑色面板会弹出，显示所有 `console.log` 日志
3. 再次点击可关闭面板

---

## 🔍 日志内容示例

```
🔧 调试面板已初始化
📦 HairSwap App 版本：1
📸 点击上传照片按钮
📁 photo-input 文件选择
🔄 showPage 被调用：loading-page 2026-03-10T16:39:51.187Z
✅ showPage 完成：loading-page
📡 请求服务器：http://106.52.29.87:3001/generate
💾 历史记录已保存到 localStorage
✅ 历史记录已保存
🔄 showPage 被调用：result-page 2026-03-10T16:40:22.049Z
✅ showPage 完成：result-page
💾 历史记录已保存到服务器：发型 8
```

---

## 🎯 常见调试场景

### 场景 1：生图失败

**查看日志**：
1. 点击 DEBUG 按钮
2. 查看 `/generate` 请求的完整 URL
3. 检查是否有错误信息

**常见问题**：
- ❌ `Request failed with status code 401` → API Key 无效或未配置
- ❌ `Request failed with status code 400` → 参数错误或模型未开通
- ❌ `Network request failed` → 网络连接问题

### 场景 2：验证缓存刷新

**查看版本号**：
1. 查看右下角的版本号（如 `v1`）
2. 更新代码后，版本号应该增加（如 `v2`）
3. 如果版本号未变，说明缓存了旧版本

**强制刷新缓存**：
- 方法 A：在 URL 后加强制参数 `?t=20260310`
- 方法 B：清除 Safari 历史记录与网站数据
- 方法 C：完全关闭 Safari 重新打开

### 场景 3：历史记录保存失败

**查看日志**：
1. 检查是否有 `历史记录已保存到服务器` 日志
2. 检查是否有错误信息
3. 查看 localStorage 是否保存成功

---

## 📋 版本号管理

### 更新流程

1. 修改 `h5/js/app.js` 顶部的版本号：
   ```javascript
   const APP_VERSION = 2; // 每次更新代码前请 +1
   ```

2. 上传到服务器：
   ```bash
   scp h5/js/app.js root@服务器 IP:/root/HairSwap/h5/js/app.js
   ```

3. 在手机上验证：
   - 启用版本号显示（取消 `this.showVersion()` 注释）
   - 刷新页面，确认右下角显示新版本号

### 版本号规则

- 每次更新代码前 +1
- 用于验证浏览器是否加载了最新代码
- 部署到生产环境时，建议注释掉版本号显示

---

## 🚀 生产环境部署

### 建议配置

**生产环境应该注释掉的内容**：

1. `h5/index.html` 中的调试按钮 HTML
2. `h5/js/app.js` 中的 `this.showVersion()` 调用

**原因**：
- 避免影响用户体验
- 减少页面元素
- 隐藏调试信息

### 快速切换方法

使用 Git 分支管理：
```bash
# 开发分支（启用调试）
git checkout dev
# 取消调试功能注释

# 生产分支（禁用调试）
git checkout main
git merge dev
# 注释掉调试功能
git commit -m "部署到生产环境"
```

---

## 📖 相关文档

- [README.md](README.md) - 项目说明
- [iteration-log.html](iteration-log.html) - 迭代日志
- [TROUBLESHOOTING.md](h5/TROUBLESHOOTING.md) - 故障排查指南

---

## 💡 技巧总结

1. **调试面板**：移动端开发神器，无需连接 Mac
2. **版本号**：快速验证缓存是否刷新
3. **日志分级**：使用不同 emoji 标记日志类型（✅ ❌ ⚠️ 📡 等）
4. **日志限制**：只保留最近 50 条，避免内存占用过大

---

**最后更新**：2026-03-10  
**版本**：v1.0
