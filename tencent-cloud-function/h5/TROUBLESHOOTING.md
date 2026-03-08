# 🔧 故障排除指南

## 问题："本地服务未启动或生成失败"

### 可能原因和解决方案

#### 1️⃣ 前端缓存问题（最常见）

**症状**：修改了代码但浏览器没有生效

**解决方案**：
```
强制刷新浏览器：
- Mac: Cmd + Shift + R
- Windows: Ctrl + Shift + R
```

或者清除缓存后重新访问 http://localhost:8000

---

#### 2️⃣ 服务未运行

**检查服务状态**：

打开终端运行：
```bash
# 检查端口 3000（API 服务器）
lsof -i :3000

# 检查端口 8000（前端服务器）
lsof -i :8000
```

**启动服务**：
```bash
# 终端 1 - 启动 API 服务器
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js

# 终端 2 - 启动前端服务器
cd /Users/AS/codex-project/HairSwap/h5
python3 -m http.server 8000
```

---

#### 3️⃣ 发型模板文件问题

**检查文件是否存在**：
```bash
ls -la /Users/AS/codex-project/HairSwap/h5/images/
```

应该看到：
- 发型 01.png
- 发型 02.png
- 发型 03.png
- 发型 04.png

**如果文件不存在**，运行：
```bash
cd /Users/AS/codex-project/HairSwap/h5
node copy-images.js
```

---

#### 4️⃣ API Key 配置问题

**检查 .env 文件**：
```bash
cat /Users/AS/codex-project/HairSwap/.env
```

应该包含：
```
VOLCENGINE_API_KEY=你的 API_KEY
```

---

#### 5️⃣ 查看错误日志

**浏览器控制台**：
1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 查看错误信息

**API 服务器日志**：
查看运行 `node test-server.js` 的终端输出

---

## ✅ 验证清单

在测试前，请确认：

- [ ] API 服务器运行在端口 3000
- [ ] 前端服务器运行在端口 8000
- [ ] h5/images 目录有 4 个发型模板
- [ ] .env 文件包含正确的 API Key
- [ ] 浏览器已强制刷新

---

##  快速测试

1. 访问 http://localhost:8000
2. 上传照片（点击上传区域）
3. 选择发型（点击发型卡片）
4. 点击"立即生成"
5. 等待 10-20 秒
6. 查看结果

---

## 📞 需要帮助？

提供以下信息以便快速定位问题：

1. 浏览器控制台的完整错误信息
2. API 服务器的终端输出
3. 是否看到加载动画
4. 具体在哪一步出错
