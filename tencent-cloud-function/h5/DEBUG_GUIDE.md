# 🔧 故障排除 - "本地服务未启动或生成失败"

## 问题诊断步骤

### 1️⃣ 检查服务状态

**终端 1** - API 服务器（端口 3000）应该显示：
```
🚀 HairSwap 本地测试服务器
📍 端口：3000
🔧 API Key: 已配置
✅ 服务器运行中
```

**终端 2** - 前端服务器（端口 8000）应该显示：
```
Serving HTTP on :: port 8000
```

### 2️⃣ 查看错误日志

**在 API 服务器的终端中查看输出**：

当点击"立即生成"后，应该看到：
```
📥 收到生成请求
   发型模板：images/hairstyle1.png
   照片 Base64 长度：xxxxx
   完整路径：/Users/AS/codex-project/HairSwap/h5/images/hairstyle1.png
📤 调用火山引擎 API...
   照片大小：xxxxx bytes
   发型大小：xxxxx bytes
```

**可能的错误**：

#### ❌ 发型模板文件不存在
```
❌ 发型模板文件不存在：/Users/AS/.../hairstyle1.png
```
**解决**：确保已重命名文件为英文

#### ❌ API 返回 400 错误
```
❌ 生成失败：Request failed with status code 400
```
**可能原因**：
- 图片太大（超过 10MB）
- 图片格式不正确
- API Key 无效
- 模型未开通

#### ❌ API 返回 401 错误
```
❌ 生成失败：Request failed with status code 401
```
**解决**：检查 .env 文件中的 API Key 是否正确

### 3️⃣ 使用测试页面

访问 http://localhost:8000/test-page.html

1. 点击"测试 API" - 检查服务是否正常
2. 选择照片 - 上传测试图片
3. 点击"测试上传" - 测试完整流程
4. 查看详细错误信息

### 4️⃣ 检查文件

```bash
cd /Users/AS/codex-project/HairSwap/h5/images
ls -lh
```

应该看到：
```
-rw-r--r--  1 AS  staff   3.9M  3  7 16:51 hairstyle1.png
-rw-r--r--  1 AS  staff   4.7M  3  7 16:51 hairstyle2.png
-rw-r--r--  1 AS  staff   3.5M  3  7 16:51 hairstyle3.png
-rw-r--r--  1 AS  staff   4.0M  3  7 16:51 hairstyle4.png
```

### 5️⃣ 检查 .env 文件

```bash
cat /Users/AS/codex-project/HairSwap/.env
```

应该包含：
```
VOLCENGINE_API_KEY=你的 API_KEY_这里
```

---

## 常见错误和解决方案

### 错误 1: 图片 404
**症状**：浏览器控制台显示图片 404
**解决**：
1. 重命名文件为英文
2. 强制刷新浏览器（Cmd+Shift+R）

### 错误 2: 服务未启动
**症状**：点击生成后立即显示错误
**解决**：
1. 确认两个终端都在运行
2. 检查端口是否被占用

### 错误 3: API 400 错误
**症状**：进入加载动画后显示失败
**解决**：
1. 查看 API 服务器终端的详细错误
2. 检查图片大小（应该<10MB）
3. 检查 API Key 是否正确
4. 确认模型已开通

### 错误 4: CORS 错误
**症状**：浏览器显示 CORS 错误
**解决**：
1. 确保 test-server.js 设置了 CORS 头
2. 清除浏览器缓存

---

## 快速诊断命令

```bash
# 1. 检查服务是否运行
lsof -i :3000
lsof -i :8000

# 2. 检查文件
ls -lh /Users/AS/codex-project/HairSwap/h5/images/

# 3. 检查 API Key
cat /Users/AS/codex-project/HairSwap/.env

# 4. 重启服务
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

cd /Users/AS/codex-project/HairSwap/h5
node test-server.js  # 终端 1
python3 -m http.server 8000  # 终端 2
```

---

## 联系支持

如果以上方法都无法解决，请提供：
1. 浏览器控制台的完整错误
2. API 服务器终端的输出
3. 图片大小和格式
4. .env 文件内容（隐藏 API Key）
