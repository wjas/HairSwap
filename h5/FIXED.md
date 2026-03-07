# ✅ 参数格式错误已修复

## 问题原因

前端发送的请求参数格式不对：

**之前（错误）：**
```javascript
{
  model: 'doubao-seedream-5-0-260128',
  image: [photoBase64, hairstyleBase64],
  size: '2K',
  ...
}
```

**现在（正确）：**
```javascript
{
  photoBase64: 'data:image/png;base64,...',
  hairstylePath: 'images/hairstyle1.png',
  prompt: '请保持脸部、五官、背景不变...'
}
```

## 已修复的文件

- ✅ `test-server.js` - 添加参数验证和详细错误信息
- ✅ `api-debug.html` - 使用正确的参数格式

## 🚀 现在可以测试了

### 方式 1：使用调试页面

访问 **http://localhost:8000/api-debug.html**

1. 上传照片（照片 01.png）
2. 点击"使用实际图片测试"
3. 查看结果

### 方式 2：使用主页面

访问 **http://localhost:8000**

1. 上传照片
2. 选择发型
3. 点击"立即生成"

## 📊 预期结果

### 成功：
```
📥 收到生成请求
   发型模板：images/hairstyle1.png
   照片 Base64 长度：xxxxx
   完整路径：/Users/AS/codex-project/HairSwap/h5/images/hairstyle1.png
📤 调用火山引擎 API...
   照片大小：xxxxx bytes
   发型大小：xxxxx bytes
✅ 生成成功：https://...
```

### 失败（会显示具体原因）：
```
❌ 生成失败：缺少 photoBase64 参数
```
或
```
❌ 生成失败：发型模板文件不存在：...
```
或
```
❌ 生成失败：Request failed with status code 400
   状态码：400
   响应数据：{...}
```

## 💡 如果还是失败

请提供：
1. API 服务器终端的完整输出
2. 浏览器控制台（F12）的错误信息
3. 上传的照片大小
