# HairSwap 技术文档 📚

**最后更新**: 2026-03-07

---

## 📋 目录

1. [项目架构](#项目架构)
2. [技术栈](#技术栈)
3. [文件结构](#文件结构)
4. [核心功能](#核心功能)
5. [API 接口](#api-接口)
6. [数据存储](#数据存储)
7. [部署说明](#部署说明)

---

## 🏗️ 项目架构

### 整体架构
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   前端 H5   │ ──────▶ │  测试服务器  │ ──────▶ │ 火山引擎 API │
│  (8000 端口) │         │  (3001 端口)  │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       ▼                        ▼
┌─────────────┐         ┌──────────────┐
│  浏览器缓存  │         │ 文件系统存储  │
│ (临时数据)  │         │ (h5/history) │
└─────────────┘         └──────────────┘
```

### 工作流程
```
1. 用户上传照片
   ↓
2. 选择发型模板
   ↓
3. 调用火山引擎 API 生成
   ↓
4. 下载生成图片
   ↓
5. 保存到文件系统
   ├─ metadata.json
   ├─ original.png
   └─ result.png
   ↓
6. 显示结果并提供对比功能
```

---

## 💻 技术栈

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **无框架依赖** - 纯原生实现

### 后端
- **Node.js** - 测试服务器
- **原生 HTTP 模块** - 轻量级服务
- **Axios** - HTTP 客户端（下载图片）

### 第三方服务
- **火山引擎 Seedream 5.0** - AI 换发型 API
  - 模型：`doubao-seedream-5-0-260128`
  - 功能：图片编辑、发型替换

---

## 📁 文件结构

```
HairSwap/
├── h5/                          # 前端目录
│   ├── index.html              # 主页面
│   ├── export-history.html     # 导出工具（已废弃）
│   ├── clean-storage.html      # 清理工具（已废弃）
│   │
│   ├── js/
│   │   └── app.js              # 主应用逻辑
│   │
│   ├── styles/
│   │   └── main.css            # 主样式文件
│   │
│   ├── images/
│   │   ├── README.md           # 发型模板说明
│   │   ├── 发型 01.png         # 发型模板 1
│   │   └── 发型 02.png         # 发型模板 2
│   │
│   ├── history/                # 历史记录存储
│   │   ├── README.md           # 说明文档
│   │   └── [记录 ID]/          # 每条记录独立文件夹
│   │       ├── metadata.json   # 元数据
│   │       ├── original.png    # 原图
│   │       └── result.png      # 生成图
│   │
│   └── test-server.js          # 测试服务器
│
├── .env                        # 环境变量（API Key）
└── README.md                   # 项目说明
```

---

## 🎯 核心功能

### 1. 图片上传
- 支持拍照或从相册选择
- 自动压缩和预览
- Base64 编码传输

### 2. 发型选择
- 预定义发型模板
- 可视化选择界面
- 支持动态添加

### 3. AI 生成
- 调用火山引擎 API
- 智能发型替换
- 保持脸部特征

### 4. 结果展示
- 高清结果展示
- 前后对比功能（长按右下角按钮）
- 保存图片到本地

### 5. 历史记录
- 自动保存到文件系统
- 永久存储，不受缓存影响
- 支持查看和对比

---

## 🔌 API 接口

### 前端接口（测试服务器提供）

#### 1. POST /generate
**生成发型**

**请求**：
```json
{
  "photoBase64": "data:image/png;base64,...",
  "hairstylePath": "images/发型 01.png",
  "prompt": "将图 1 的发型换为图 2 的发型"
}
```

**响应**：
```json
{
  "success": true,
  "imageUrl": "https://xxx.volces.com/xxx.png"
}
```

#### 2. POST /save-history
**保存历史记录**

**请求**：
```json
{
  "id": 1772892611265,
  "hairstyleName": "发型 1",
  "createdAt": "2026-03-07T14:10:11.265Z",
  "originalImage": "data:image/png;base64,...",
  "resultImage": "https://xxx.volces.com/xxx.png"
}
```

**响应**：
```json
{
  "success": true
}
```

#### 3. GET /history-list
**获取历史记录列表**

**响应**：
```json
{
  "records": [
    {
      "id": 1772892611265,
      "hairstyleName": "发型 1",
      "createdAt": "2026-03-07T14:10:11.265Z",
      "imageUrl": "/history/1772892611265/result.png?t=1772893056992"
    }
  ]
}
```

#### 4. GET /history/:id
**获取单条记录详情**

**响应**：
```json
{
  "id": 1772892611265,
  "hairstyleName": "发型 1",
  "createdAt": "2026-03-07T14:10:11.265Z",
  "originalImage": "data:image/png;base64,...",
  "imageUrl": "data:image/png;base64,..."
}
```

#### 5. GET /history/:id/result.png
**获取历史记录缩略图**

**响应**：
- Content-Type: image/png
- Body: 二进制图片数据

---

## 💾 数据存储

### 存储策略对比

| 存储方式 | 用途 | 优点 | 缺点 |
|---------|------|------|------|
| **localStorage** | ❌ 已弃用 | 快速访问 | 5-10MB 限制 |
| **文件系统** | ✅ 主要存储 | 无限制、永久保存 | 需要服务器 |

### 历史记录结构

```
h5/history/1772892611265/
├── metadata.json          # 元数据（JSON）
│   {
│     "id": 1772892611265,
│     "hairstyleName": "发型 1",
│     "createdAt": "2026-03-07T14:10:11.265Z"
│   }
├── original.png           # 用户上传原图（1-3MB）
└── result.png            # AI 生成图（1-3MB）
```

### 数据流

```
生成成功
   ↓
前端发送数据到服务器
   ├─ originalImage: Base64
   └─ resultImage: URL
   ↓
服务器处理
   ├─ originalImage → 转二进制 → original.png
   └─ resultImage → 下载 → result.png
   ↓
保存到文件系统
```

---

## 🚀 部署说明

### 开发环境

#### 1. 配置环境变量
创建 `.env` 文件：
```bash
VOLCENGINE_API_KEY=your_api_key_here
VOLCENGINE_MODEL=doubao-seedream-5-0-260128
```

#### 2. 启动测试服务器
```bash
cd h5
node test-server.js
```

#### 3. 配置 Nginx（可选）
```nginx
server {
    listen 8000;
    server_name localhost;
    
    root /path/to/HairSwap/h5;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 代理 API 请求
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 4. 访问应用
```
http://localhost:8000
```

### 生产环境

#### 前端部署
- 使用 Nginx 或 Apache 托管静态文件
- 启用 HTTPS
- 配置 CDN 加速图片加载

#### 后端部署
- 使用 PM2 管理 Node.js 进程
- 配置负载均衡
- 设置自动重启

#### 安全配置
- 限制 API 调用频率
- 验证用户身份
- 加密敏感数据

---

## 🛠️ 开发指南

### 添加新发型

1. 准备发型图片（512x512 PNG，背景简洁）
2. 放到 `h5/images/` 目录
3. 更新 `h5/images/README.md`
4. 在 `app.js` 中添加配置

### 修改对比按钮图标

对比按钮使用 SVG 图标，位于 `index.html`：
```html
<button id="compare-btn" class="compare-btn">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <!-- 左半圆虚线 -->
    <path stroke-dasharray="3 3" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20" />
    <!-- 右半圆实线 -->
    <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" />
    <!-- 中间分割线 -->
    <path d="M12 4V20" />
  </svg>
</button>
```

图标含义：
- **左虚线**：代表原图
- **右实线**：代表生成图
- **分割线**：代表对比功能

### 调试技巧

#### 前端调试
```javascript
// 在浏览器控制台
console.log('当前状态:', app.state);
```

#### 后端调试
```bash
# 查看服务器日志
tail -f /path/to/server.log
```

#### 网络请求调试
```javascript
// 在浏览器控制台监听请求
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('history'))
  .forEach(r => console.log(r));
```

---

## 📊 性能优化

### 图片优化
- 上传时自动压缩
- 使用 WebP 格式（可选）
- CDN 缓存生成图

### 存储优化
- 定期清理旧记录
- 压缩元数据
- 使用对象存储（可选）

### 网络优化
- 启用 Gzip 压缩
- 使用 HTTP/2
- 预加载关键资源

---

## 🔒 安全注意事项

1. **API Key 保护**
   - 不要提交到版本控制
   - 使用环境变量
   - 定期轮换

2. **用户隐私**
   - 不上传用户照片到云端
   - 本地处理敏感数据
   - 提供删除功能

3. **访问控制**
   - 限制 API 调用频率
   - 验证请求来源
   - 使用 HTTPS

---

## 📝 更新日志

### 2026-03-07
- ✅ 修复历史记录缩略图显示问题
- ✅ 更新对比按钮图标（虚线半圆设计）
- ✅ 优化服务器路由顺序
- ✅ 添加图片 URL 调试日志
- ✅ 完善技术文档

### 之前版本
- 实现基础生成功能
- 添加历史记录保存
- 实现前后对比功能
- 优化用户体验

---

## 📞 技术支持

- **火山引擎文档**: https://www.volcengine.com/docs
- **Node.js 文档**: https://nodejs.org/docs
- **MDN Web 文档**: https://developer.mozilla.org

---

**HairSwap** - AI 驱动的虚拟换发型工具
