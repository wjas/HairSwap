# HairSwap - AI 换发型 Demo

## 这个项目是做什么的
这是一个基于火山引擎 doubao-seedream 5.0 模型的 AI 换发型 H5 Demo 项目。用户只需上传照片并选择发型模板，即可一键生成换发型后的效果图片。

**核心功能**：
- 用户上传/拍摄正面照片
- 选择发型模板（4 个）
- AI 生成换发型效果
- 保存结果图片
- 查看生成历史记录

**技术特点**：
- 使用火山引擎 doubao-seedream-5-0-260128 模型
- 多图融合技术，保持脸部、背景不变
- 无需用户登录，即开即用
- 文件系统存储历史记录（永久保存）
- 保护用户隐私，不存储上传照片
- 前后对比功能（长按对比按钮）

---

## 当前完成了哪些步骤

### 已完成功能 ✅

1. **火山引擎 API 集成**
   - 注册账号，开通 doubao-seedream-5-0-260128 模型服务
   - 创建推理接入点，获取 API Key
   - API 连通性测试通过

2. **H5 前端开发**
   - 移动端优先的响应式设计
   - 纯 HTML/CSS/JavaScript 实现
   - 照片上传功能（支持拍照/相册）
   - 发型选择功能（4 个模板）
   - AI 生成按钮
   - 结果展示页面
   - 保存图片功能（新窗口打开，长按保存）
   - 生成历史记录功能（文件系统永久存储）
   - 前后对比功能（长按对比按钮）

3. **本地测试环境**
   - 创建本地测试服务器（test-server.js）
   - 支持直接调用火山引擎 API
   - 完整的错误处理和日志输出

4. **测试验证**
   - API 连通性测试：✅ 成功
   - 换发型测试：✅ 成功（多次测试）
   - 本地服务器测试：✅ 成功
   - 移动端兼容性测试：✅ 成功（iOS/Android）

5. **文档完善**
   - README.md - 项目说明
   - TECHNICAL_DOCS.md - 技术文档（完整架构与 API）
   - LOCAL_TESTING.md - 本地测试指南
   - DEPLOYMENT.md - 云函数部署指南
   - TROUBLESHOOTING.md - 故障排查指南
   - iteration-log.html - 迭代日志

**测试结果**：
- API 连通性测试：✅ 成功（2048x2048，16384 tokens）
- 换发型测试 1（照片 01 + 发型 02）：✅ 成功
- 换发型测试 2（照片 01 + 发型 01）：✅ 成功
- 历史记录存储：✅ 成功（文件系统永久保存）

**总成本**：约 0.44 元（0.22 元/张 × 2 张）

**免费额度**：新用户 100 次免费调用（有效期 30 天）

**当前版本**：v1.4.0（2026-03-08）

---

## 云部署状态

### 火山引擎部署
- ✅ 云函数已部署并运行成功（状态：Ready）
- ✅ 函数服务代码已打包为 vein-function-fixed.zip（包含历史记录）
- ✅ 已配置 Serverless 网关实例（免托管费用）
- ✅ 已配置环境变量（VOLCANO_API_KEY、VOLCANO_MODEL、VOLCANO_ENDPOINT）
- ✅ 历史记录已同步到云端（包含所有历史生成记录）
- ⏳ 等待配置 API 网关触发器以获取访问地址

### Vercel 部署
- ✅ Vercel 部署配置已创建（vercel.json）
- ✅ 已部署到 Vercel（https://hair-swap.vercel.app/）
- ✅ 发型缩略图已修复（已提交到 Git）
- ✅ localStorage 历史记录支持

### 腾讯云部署
- ✅ 腾讯云部署方案已准备（TENCENT_CLOUD_DEPLOY.md、TENCENT_CLOUD_STEPS.md）
- ✅ 腾讯云部署代码包已准备（tencent-cloud-function.zip，72MB，包含历史记录）
- ✅ 轻量应用服务器方案已准备

### CloudBase 部署
- ✅ CloudBase 部署方案已准备（CLOUDBASE_DEPLOY.md）
- ✅ CloudBase 云函数代码已准备（cloudbase/functions/）

### 部署文档
- `VEIN_DEPLOYMENT.md` - 火山引擎完整部署指南
- `VEIN_DEPLOY_STEPS.md` - 火山引擎详细部署步骤
- `TENCENT_CLOUD_DEPLOY.md` - 腾讯云部署指南
- `TENCENT_CLOUD_STEPS.md` - 腾讯云详细部署步骤
- `CLOUDBASE_DEPLOY.md` - CloudBase 部署指南
- `DEPLOYMENT_OPTIONS.md` - 部署方案对比
- `QUICK_DEPLOY.md` - 快速部署指南
- `VERCEL_DEPLOY_CHECKLIST.md` - Vercel 部署检查清单

---

## 缩略图功能
- ✅ 历史记录缩略图：result_thumb.jpg（400px 宽，JPEG 格式，质量 80%
- ✅ 发型模板缩略图：hairstyle{1-4}_thumb.jpg（400px 宽）
- ✅ 体积优化：约 15-180 倍缩小
- ✅ 自动生成：新生成图片自动生成缩略图

---

## 历史记录存储策略
- ✅ 双重保存策略：同时保存到服务器和 localStorage
- ✅ 优先从服务器加载（局域网环境）
- ✅ 失败时自动切换到 localStorage（Vercel 静态环境）

---

## 下一步应该做什么

### 近期计划 📋

1. **完成部署**
   - 配置 API 网关触发器，获取访问地址
   - 测试访问地址，验证完整功能
   - 分享给朋友同事体验

2. **测试优化**
   - 手机兼容性测试（iOS/Android）
   - 性能优化（图片压缩、加载速度）
   - 用户体验优化

3. **功能增强**
   - 增加发型模板数量（10-20 个）
   - 支持自定义上传发型参考图
   - 支持多角度照片

### 长期规划 

1. **产品化**
   - 用户系统（登录/注册）
   - 付费套餐（包月/包年）
   - 云端存储（历史作品）

2. **多端扩展**
   - 微信小程序版本
   - Web 完整版（PC 端）
   - 原生 App（iOS/Android）

3. **AI 能力提升**
   - 自动头发分割
   - 发色调整
   - 发型推荐算法

---

## 常用命令

```bash
# 安装依赖
npm install

# API 连通性测试
npm test

# 换发型功能测试
npm run test:hair
```

---

## 项目结构

```
HairSwap/
├── README.md                  # 项目说明文档
├── TECHNICAL_DOCS.md          # 技术文档（完整架构与 API）
├── iteration-log.html         # 迭代日志
├── h5_volcengine_demo_plan.html  # 详细方案文档
├── package.json               # 项目配置
├── .env                       # 环境变量（不提交到 Git）
├── test-api.js               # API 连通性测试脚本
├── test-hair-swap.js         # 换发型功能测试脚本
├── 照片 01.png、发型 01.png、发型 02.png  # 测试图片
├── h5/                       # H5 前端目录
│   ├── index.html            # 主页面
│   ├── test-image.html       # 图片访问测试页面
│   ├── styles/
│   │   └── main.css          # 样式文件
│   ├── js/
│   │   └── app.js            # 前端逻辑
│   ├── images/               # 发型模板
│   ├── history/              # 历史记录存储（文件系统）
│   │   └── [记录 ID]/        # 每条记录独立文件夹
│   │       ├── metadata.json # 元数据
│   │       ├── original.png  # 原图
│   │       ├── result.png    # 生成图
│   │       └── result_thumb.jpg # 缩略图（400px 宽，JPEG）
│   ├── test-server.js        # 本地测试服务器
│   ├── LOCAL_TESTING.md      # 本地测试指南
│   ├── DEPLOYMENT.md         # 部署指南
│   └── TROUBLESHOOTING.md    # 故障排查
├── scripts/                  # 脚本目录
│   └── generate-thumbnails.js # 缩略图生成脚本
├── vein-function/            # 火山引擎函数服务部署包
│   ├── index.js             # 函数入口
│   ├── package.json         # 依赖配置
│   ├── public/              # 静态资源
│   │   ├── index.html
│   │   ├── images/
│   │   └── history/         # 历史记录
│   └── generate-thumbnails.js
├── vein-function-fixed.zip   # 火山引擎部署压缩包
├── tencent-cloud-function/   # 腾讯云函数服务部署包
│   ├── index.js
│   ├── package.json
│   └── public/
├── tencent-cloud-function.zip # 腾讯云部署压缩包
├── cloudbase/                # 腾讯云 CloudBase 部署
│   ├── functions/
│   │   └── generate/
│   │       ├── index.js
│   │       └── package.json
│   └── static/
├── vercel.json              # Vercel 部署配置
├── VEIN_DEPLOYMENT.md       # 火山引擎部署指南
├── VEIN_DEPLOY_STEPS.md     # 火山引擎部署步骤
├── TENCENT_CLOUD_DEPLOY.md  # 腾讯云部署指南
├── TENCENT_CLOUD_STEPS.md   # 腾讯云部署步骤
├── CLOUDBASE_DEPLOY.md      # CloudBase 部署指南
├── DEPLOYMENT_OPTIONS.md    # 部署方案对比
├── QUICK_DEPLOY.md          # 快速部署指南
└── VERCEL_DEPLOY_CHECKLIST.md # Vercel 检查清单
```

---

## 注意事项

1. **API Key 安全**：不要将 `.env` 文件提交到 Git。
2. **结果有效期**：API 返回的图片 URL 有效期 24 小时。
3. **图片要求**：PNG/JPG，不超过 10MB，建议正面清晰照片。
4. **历史记录**：存储在文件系统（h5/history/），永久保存，不会丢失。
5. **CORS 限制**：由于火山引擎图片 URL 有 CORS 限制，保存图片时需在新窗口打开后长按保存。
6. **对比功能**：长按右下角对比按钮可查看原图，松开恢复生成图。

---

## 快速开始

### 本地测试（开发模式）

```bash
# 1. 启动本地测试服务器（终端 1）
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js

# 2. 启动前端服务器（终端 2）
cd /Users/AS/codex-project/HairSwap/h5
python3 -m http.server 8000

# 3. 访问测试
# 打开浏览器访问：http://localhost:8000
```

### 生产部署

详见 [`h5/DEPLOYMENT.md`](h5/DEPLOYMENT.md)

---

## 技术支持

- 火山引擎文档：https://www.volcengine.com/docs/82379/1541523
- 问题反馈：查看 [TROUBLESHOOTING.md](h5/TROUBLESHOOTING.md)
