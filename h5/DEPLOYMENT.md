# HairSwap 云函数部署指南

## 概述

本文档说明如何部署后端云函数，用于安全存储 API Key 并调用火山引擎 doubao-seedream API。

## 架构说明

```
用户手机 → H5 前端 → 云函数（安全存储 API Key） → 火山引擎 API
```

**为什么需要云函数？**
- 避免在前端暴露 API Key
- 统一处理错误和重试逻辑
- 便于后续添加用户认证、限流等功能

## 方案选择

### 推荐：火山引擎云函数（同平台，延迟最低）

**优势：**
- 与火山引擎方舟 API 在同一平台，网络延迟最低
- 新用户有免费额度
- 配置简单，支持 Node.js 运行时

**备选方案：**
- 腾讯云 CloudBase
- 阿里云函数计算
- Vercel / Netlify（海外服务）

---

## 火山引擎云函数部署步骤

### 1. 准备工作

1. 登录 [火山引擎控制台](https://console.volcengine.com/)
2. 进入 **云函数服务**
3. 点击 **创建函数**

### 2. 创建函数

**基础配置：**
- 函数名称：`hairswap-api`
- 运行环境：Node.js 18
- 内存配置：256MB
- 超时时间：60 秒
- 触发方式：API 网关触发

**代码示例：**

```javascript
// index.js
const axios = require('axios');

const CONFIG = {
  VOLCENGINE_API_KEY: process.env.VOLCENGINE_API_KEY,
  VOLCENGINE_MODEL: 'doubao-seedream-5-0-260128',
  VOLCENGINE_BASE_URL: 'https://ark.cn-beijing.volces.com/api/v3'
};

exports.handler = async (event, context) => {
  try {
    // 解析请求体
    const { photoBase64, hairstylePath, prompt } = JSON.parse(event.body);

    // 读取发型模板图片并转换为 base64
    const hairstyleBase64 = await readHairstyleImage(hairstylePath);

    // 调用火山引擎 API
    const response = await axios.post(
      `${CONFIG.VOLCENGINE_BASE_URL}/images/generations`,
      {
        model: CONFIG.VOLCENGINE_MODEL,
        prompt: prompt || '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型，发际线自然，发色一致，高质量，逼真',
        image: [photoBase64, hairstyleBase64],
        size: '2K',
        sequential_image_generation: 'disabled',
        response_format: 'url',
        stream: false,
        watermark: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.VOLCENGINE_API_KEY}`
        },
        timeout: 60000
      }
    );

    const imageUrl = response.data.data[0].url;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        imageUrl: imageUrl
      })
    };

  } catch (error) {
    console.error('生成失败:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: error.message || '生成失败，请稍后重试'
      })
    };
  }
};

// 读取发型模板图片（从对象存储或本地）
async function readHairstyleImage(hairstylePath) {
  // 方案 1：从火山 TOS 读取
  // 方案 2：从函数代码包读取（小文件）
  // 这里简化处理，实际需要根据你的存储方案调整
  const fs = require('fs');
  const path = require('path');
  const imageBuffer = fs.readFileSync(path.join(__dirname, hairstylePath));
  return imageBuffer.toString('base64');
}
```

### 3. 配置环境变量

在云函数控制台添加以下环境变量：

```
VOLCENGINE_API_KEY=你的 API_KEY（bbb3102e-6d74-4607-823c-573fbe2e7581）
```

### 4. 配置 API 网关触发器

1. 在函数详情页，点击 **触发器管理**
2. 点击 **添加触发器**
3. 选择 **API 网关触发器**
4. 配置：
   - API 名称：`hairswap-generate`
   - 请求方法：`POST`
   - 鉴权方式：`公开`（或根据需要配置）
5. 保存后，复制生成的 API 地址

### 5. 更新前端配置

修改 `h5/js/app.js` 中的 `apiBaseUrl`：

```javascript
this.config = {
  apiBaseUrl: 'https://你的 API 网关地址'
};
```

---

## 本地测试云函数

### 1. 安装依赖

```bash
cd h5
npm init -y
npm install axios
```

### 2. 创建测试脚本

创建 `test-cloud-function.js`：

```javascript
const fs = require('fs');
const path = require('path');

async function testCloudFunction() {
  const photoPath = path.join(__dirname, '../照片 01.png');
  const photoBase64 = fs.readFileSync(photoPath).toString('base64');

  const response = await fetch('https://你的 API 网关地址/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      photoBase64: photoBase64,
      hairstylePath: 'images/发型 01.png',
      prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型'
    })
  });

  const data = await response.json();
  console.log('测试结果:', data);
}

testCloudFunction();
```

---

## 发型模板存储方案

### 方案 1：云函数代码包内（推荐用于验证阶段）

**优点：**
- 简单，无需额外配置
- 访问速度快

**缺点：**
- 代码包大小限制（通常 50MB）
- 更新模板需要重新部署

**适用场景：** 模板数量少（< 10 个），文件大小适中

### 方案 2：火山引擎 TOS 对象存储

**优点：**
- 无容量限制
- 更新模板无需重新部署
- 支持 CDN 加速

**缺点：**
- 需要额外配置 TOS 权限

**配置步骤：**
1. 创建 TOS 存储桶
2. 上传发型模板图片
3. 在云函数中配置 TOS SDK
4. 从 TOS 读取图片

---

## 安全建议

1. **API 网关鉴权**：生产环境建议配置 API Key 或 JWT 鉴权
2. **限流**：配置 API 网关限流策略，防止滥用
3. **日志**：开启云函数日志，便于问题排查
4. **监控**：配置错误告警和调用量监控

---

## 成本估算

**云函数成本（按量计费）：**
- 调用次数：前 100 万次/月 免费
- 资源使用：按 GB-秒计费，约 0.000016 元/GB-秒
- 单次调用成本：约 0.0001 元

**API 调用成本：**
- doubao-seedream-5-0-260128：0.22 元/张

**总计：**
- 每生成一张图片：约 0.22 元
- 云函数成本可忽略不计

---

## 常见问题

### Q: API 返回 404 错误
**A:** 检查 Model ID 是否正确，应该是 `doubao-seedream-5-0-260128`（连字符，不是点号）

### Q: 生成时间过长
**A:** 火山引擎 API 通常需要 10-20 秒，建议：
- 增加云函数超时时间到 60 秒
- 前端显示加载动画和预计时间

### Q: 图片保存失败
**A:** 检查 CORS 配置，确保云函数响应头包含：
```
Access-Control-Allow-Origin: *
```

---

## 下一步

1. 部署云函数并测试
2. 更新前端 `apiBaseUrl` 配置
3. 在手机上测试完整流程
4. 根据测试结果优化性能和体验
