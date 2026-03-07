# 火山引擎函数服务部署指南 🔥

##  部署前准备

### 1. 确认账号信息
- ✅ 火山引擎账号已注册
- ✅ 已完成实名认证
- ✅ doubao-seedream API 已开通

### 2. 准备材料
- API Key
- API Endpoint 地址
- 项目代码

---

## 🚀 部署步骤（20 分钟）

### 步骤 1：进入函数服务控制台（2 分钟）

1. 访问火山引擎控制台
   ```
   https://console.volcengine.com
   ```

2. 搜索"函数服务"或"Function Graph"
   - 在顶部搜索框输入"函数服务"
   - 点击进入函数服务控制台

3. 首次使用需要开通服务
   - 点击"立即开通"
   - 同意服务条款
   - 开通成功

---

### 步骤 2：创建函数（5 分钟）

#### 2.1 创建函数
1. 点击"创建函数"
2. 选择"从零开始创建"
3. 填写基本信息：
   ```
   函数名称：hairswap
   运行环境：Node.js 18
   内存配置：512MB
   超时时间：60 秒
   ```

#### 2.2 选择触发器类型
1. 选择"API 网关触发器"
2. 点击"创建新触发器"
3. 配置触发器：
   ```
   触发器名称：hairswap-trigger
   请求方法：POST
   请求路径：/api/generate
   ```

#### 2.3 完成创建
点击"完成"创建函数

---

### 步骤 3：配置环境变量（2 分钟）

1. 在函数详情页，点击"配置"标签
2. 找到"环境变量"
3. 添加 3 个环境变量：

```
VOLCANO_API_KEY = 你的火山引擎 API Key
VOLCANO_MODEL = doubao-seedream-5-0-260128
VOLCANO_ENDPOINT = ng.volces.com/api/v3/images/generations
```

4. 点击"保存"

---

### 步骤 4：准备部署代码（5 分钟）

#### 4.1 创建 Serverless 适配层

在项目根目录创建 `vein-function/` 文件夹：

```
vein-function/
├── index.js          # 函数入口
├── package.json      # 依赖配置
└── h5/              # 前端代码（复制整个 h5 目录）
```

#### 4.2 index.js 内容
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

// 火山引擎 API 配置
const API_KEY = process.env.VOLCANO_API_KEY;
const MODEL = process.env.VOLCANO_MODEL;
const ENDPOINT = process.env.VOLCANO_ENDPOINT;

// 主函数
exports.handler = async (event, context) => {
  try {
    // 解析请求
    const { path, method, headers, body } = event;
    
    // API 路由：处理 AI 生成请求
    if (path === '/api/generate' && method === 'POST') {
      return await handleGenerate(body);
    }
    
    // 静态文件服务
    return await serveStatic(path);
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// 处理 AI 生成请求
async function handleGenerate(body) {
  const { photo, hairstyle } = JSON.parse(body);
  
  // 调用火山引擎 API
  const response = await fetch(`https://${ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Change hairstyle' },
          { type: 'image_url', image_url: { url: photo } },
          { type: 'image_url', image_url: { url: hairstyle } }
        ]
      }]
    })
  });
  
  const data = await response.json();
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}

// 服务静态文件
async function serveStatic(filePath) {
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }
  
  const fullPath = path.join(__dirname, 'h5', filePath);
  
  try {
    const content = fs.readFileSync(fullPath);
    const ext = path.extname(filePath);
    
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' },
      isBase64Encoded: ext === '.png' || ext === '.jpg',
      body: content.toString('base64')
    };
  } catch (error) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>404 Not Found</h1>'
    };
  }
}
```

#### 4.3 package.json 内容
```json
{
  "name": "hairswap-vein-function",
  "version": "1.0.0",
  "description": "HairSwap on Volcengine Function",
  "main": "index.js",
  "dependencies": {},
  "devDependencies": {}
}
```

---

### 步骤 5：上传代码（3 分钟）

#### 方法 1：在线上传（推荐）
1. 在函数详情页，点击"代码"标签
2. 点击"上传代码包"
3. 将 `vein-function/` 文件夹压缩为 `vein-function.zip`
4. 上传 ZIP 文件
5. 等待上传完成

#### 方法 2：使用命令行工具
```bash
# 安装火山引擎 CLI
npm install -g @volcengine/cli

# 登录
vein login

# 部署
vein function deploy --function-name hairswap
```

---

### 步骤 6：配置 CORS（2 分钟）

1. 在触发器配置页面
2. 找到"CORS 配置"
3. 添加允许的源：
   ```
   *
   ```
4. 保存配置

---

### 步骤 7：测试函数（2 分钟）

#### 7.1 获取访问地址
1. 在触发器详情页
2. 复制"调用地址"
3. 格式类似：
   ```
   https://xxx.cn-beijing.volces.com/api/generate
   ```

#### 7.2 测试访问
在浏览器打开测试：
```
https://xxx.cn-beijing.volces.com/
```

应该能看到 HairSwap 首页

---

## 📊 部署完成检查清单

- [ ] 函数创建成功
- [ ] 环境变量配置完成
- [ ] 代码上传成功
- [ ] 触发器配置完成
- [ ] CORS 配置完成
- [ ] 访问测试通过
- [ ] API 生成测试通过

---

## 💰 成本说明

### 免费额度
- ✅ 每月 100 万次调用
- ✅ 每月 100GB 出流量
- ✅ 长期有效

### 超出后费用
- 约 0.0001 元/次调用
- 对于 Demo 基本免费

---

## 🔧 常见问题

### Q1: 函数超时怎么办？
A: 增加超时时间到 60 秒或更长

### Q2: 内存不足怎么办？
A: 增加内存到 1024MB

### Q3: 图片无法显示怎么办？
A: 检查 MIME 类型配置，确保图片正确编码

### Q4: API 调用失败怎么办？
A: 检查环境变量是否正确，API Key 是否有效

---

## 📱 分享链接

部署成功后，获得访问地址：
```
https://xxx.cn-beijing.volces.com
```

分享给朋友体验！

---

## 🔄 更新代码

### 方法 1：控制台上传
1. 修改代码
2. 重新压缩
3. 上传新版本

### 方法 2：CLI 工具
```bash
vein function update --function-name hairswap
```

---

## 📚 相关文档

- [火山引擎函数服务文档](https://www.volcengine.com/docs/6831)
- [API 网关配置指南](https://www.volcengine.com/docs/6552)
- [Node.js 运行时](https://www.volcengine.com/docs/6831/130833)

---

**祝你部署顺利！** 🚀
