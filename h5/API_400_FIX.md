# ⚠️ 重要：API 400 错误解决方案

## 问题现状

点击"立即生成"后显示"本地服务未启动或生成失败"，API 返回 400 错误。

## 根本原因

根据测试，火山引擎 API 要求 `image` 参数使用 **带 data URI 前缀的 base64 格式**：

```javascript
// ✅ 正确格式
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...

// ❌ 错误格式（纯 base64）
iVBORw0KGgoAAAANSUhEUg...
```

前端代码已经使用 `readAsDataURL()` 生成正确的格式，但需要确认以下几点。

---

## 🔧 解决步骤

### 1️⃣ 重启 API 服务器

停止当前运行的服务（两个终端都按 Ctrl+C），然后重新启动：

**终端 1：**
```bash
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js
```

**终端 2：**
```bash
cd /Users/AS/codex-project/HairSwap/h5
python3 -m http.server 8000
```

### 2️⃣ 使用调试工具测试

访问 **http://localhost:8000/api-debug.html**

1. 上传一张照片（照片 01.png）
2. 点击"使用实际图片测试"
3. 查看显示的请求详情和错误信息

### 3️⃣ 查看详细日志

在运行 `node test-server.js` 的终端中，应该看到：

```
📥 收到生成请求
   发型模板：images/hairstyle1.png
   照片 Base64 长度：xxxxx
   完整路径：/Users/AS/codex-project/HairSwap/h5/images/hairstyle1.png
📤 调用火山引擎 API...
   照片大小：xxxxx bytes
   发型大小：xxxxx bytes
```

如果失败，会显示详细的错误信息。

---

## 📊 可能的错误和解决方案

### 错误 1: "invalid url specified"
**原因**：base64 字符串没有 data URI 前缀
**解决**：前端已使用 `readAsDataURL()`，应该没问题

### 错误 2: "expected the width to be at least 14px"
**原因**：图片太小
**解决**：使用正常尺寸的照片（至少 100x100 像素）

### 错误 3: "InvalidParameter" - image
**原因**：API 参数格式不对
**解决**：可能需要调整参数结构

### 错误 4: 401 Unauthorized
**原因**：API Key 无效
**解决**：检查 .env 文件中的 API Key

### 错误 5: 模型未开通
**原因**：doubao-seedream-5-0-260128 模型未开通
**解决**：登录火山引擎控制台开通模型

---

## 🧪 手动测试 API

如果以上都不行，可以手动测试 API：

### 使用 curl 命令：

```bash
# 1. 准备测试图片（转换为 base64）
photo_base64=$(base64 -i /Users/AS/codex-project/HairSwap/照片 01.png)
hairstyle_base64=$(base64 -i /Users/AS/codex-project/HairSwap/h5/images/hairstyle1.png)

# 2. 构建请求
curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "doubao-seedream-5-0-260128",
    "prompt": "请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型",
    "image": ["data:image/png;base64,'"$photo_base64"'", "data:image/png;base64,'"$hairstyle_base64"'"],
    "size": "2K",
    "sequential_image_generation": "disabled",
    "response_format": "url",
    "stream": false,
    "watermark": true
  }'
```

---

## 📞 需要帮助？

请提供以下信息：

1. **API 服务器终端的完整输出**
2. **api-debug.html 显示的请求详情**
3. **错误消息的完整内容**
4. **上传的照片大小和尺寸**

这样可以快速定位问题！
