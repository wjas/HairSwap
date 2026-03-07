# HairSwap 部署方案对比

本文档对比了多种部署方案，帮助你选择最适合的方式来分享 HairSwap Demo 给朋友和同事体验。

---

## 📋 方案总览

| 方案 | 难度 | 成本 | 上线时间 | 适合场景 |
|------|------|------|----------|----------|
| **Vercel** | ⭐ | 免费 | 5 分钟 | 快速分享、测试 |
| **Netlify** | ⭐ | 免费 | 5 分钟 | 快速分享、测试 |
| **GitHub Pages** | ⭐⭐ | 免费 | 10 分钟 | 开源项目展示 |
| **腾讯云云函数** | ⭐⭐⭐ | 付费 | 30 分钟 | 生产环境、正式使用 |
| **阿里云函数计算** | ⭐⭐⭐ | 付费 | 30 分钟 | 生产环境、正式使用 |
| **自有服务器** | ⭐⭐⭐⭐ | 付费 | 1 小时 | 长期运营、定制化需求 |

---

## 🚀 推荐方案：Vercel（最快 5 分钟上线）

### 为什么选择 Vercel
- ✅ **完全免费**：个人版免费额度足够 Demo 使用
- ✅ **极速部署**：连接 GitHub 仓库后自动部署
- ✅ **全球 CDN**：访问速度快
- ✅ **自动 HTTPS**：无需配置证书
- ✅ **自定义域名**：支持免费绑定域名
- ✅ **持续集成**：代码更新后自动重新部署

### 部署步骤

#### 1. 准备 GitHub 仓库
```bash
# 如果还没有 Git 仓库
cd /Users/AS/codex-project/HairSwap
git init
git add .
git commit -m "Initial commit - HairSwap v1.2.0"

# 创建 GitHub 仓库并推送
# 在 GitHub 上创建新仓库，然后：
git remote add origin https://github.com/你的用户名/HairSwap.git
git branch -M main
git push -u origin main
```

#### 2. 注册 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"

#### 3. 导入项目
1. 选择 "Import Git Repository"
2. 选择 HairSwap 仓库
3. 点击 "Import"

#### 4. 配置环境变量
在 Vercel 项目设置中添加环境变量：
- `VOLCANO_API_KEY`: 你的火山引擎 API Key
- `VOLCANO_MODEL`: `doubao-seedream-5-0-260128`
- `VOLCANO_ENDPOINT`: 你的 API 接入点地址

#### 5. 部署完成
- Vercel 会自动构建并部署
- 获得免费域名：`https://hairswap-xxx.vercel.app`
- 可以立即分享给朋友体验

### 配置前端 API 地址
修改 `h5/js/config.js`：
```javascript
const API_BASE_URL = 'https://hairswap-xxx.vercel.app/api';
```

### 访问限制
- 免费额度：每月 100GB 流量
- 函数执行：每月 100 万秒
- 对于 Demo 完全够用

---

## 🌐 方案二：Netlify（与 Vercel 类似）

### 为什么选择 Netlify
- ✅ 免费额度充足
- ✅ 部署简单
- ✅ 支持表单、函数等高级功能

### 部署步骤
1. 访问 [netlify.com](https://netlify.com)
2. 使用 GitHub 账号登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择 HairSwap 仓库
5. 配置环境变量
6. 点击 "Deploy site"

### 获得域名
`https://hairswap-xxx.netlify.app`

---

## 📄 方案三：GitHub Pages（纯静态）

### 为什么选择 GitHub Pages
- ✅ 完全免费
- ✅ 与 GitHub 深度集成
- ✅ 适合纯静态页面

### 限制
- ❌ 无法运行后端函数
- ❌ 需要单独部署 API 服务

### 部署步骤
```bash
# 安装 Vercel CLI（用于本地测试）
npm install -g vercel

# 或者使用 GitHub Actions 自动部署
```

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `main` 分支和 `/h5` 文件夹
3. 获得域名：`https://你的用户名.github.io/HairSwap`

### API 配置
需要另外部署 API 服务（如云函数），然后修改前端配置。

---

## ☁️ 方案四：腾讯云云函数（生产环境）

### 为什么选择腾讯云
- ✅ 国内访问速度快
- ✅ 支持 Node.js 运行时
- ✅ 按量付费，成本低
- ✅ 适合正式生产环境

### 部署步骤
详见 `h5/DEPLOYMENT.md`

### 成本估算
- 免费额度：每月 100 万次调用
- 超出后：约 0.0001 元/次
- 对于 Demo 基本免费

### 获得域名
`https://service-xxx.bj.apigw.tencentcs.com/release/hairswap`

---

## 🌩️ 方案五：阿里云函数计算（生产环境）

### 为什么选择阿里云
- ✅ 国内访问速度快
- ✅ 稳定性高
- ✅ 生态系统完善

### 部署步骤
1. 注册阿里云账号
2. 开通函数计算服务
3. 创建函数（Node.js 运行时）
4. 上传代码包
5. 配置 API 网关
6. 设置环境变量

### 成本估算
- 免费额度：每月 100 万次调用
- 超出后：按资源使用量计费

---

## 🖥️ 方案六：自有服务器（完全控制）

### 为什么选择自有服务器
- ✅ 完全控制
- ✅ 数据隐私
- ✅ 无供应商锁定

### 推荐服务商
- **VPS**: DigitalOcean, Linode, Vultr（$5/月起）
- **国内**: 阿里云 ECS，腾讯云 CVM（需备案）

### 部署步骤
1. 购买服务器
2. 安装 Node.js
3. 上传代码
4. 配置 Nginx 反向代理
5. 配置 HTTPS（Let's Encrypt）
6. 设置 PM2 进程管理

### 成本估算
- VPS：$5-10/月
- 域名：$10-15/年
- SSL 证书：免费（Let's Encrypt）

---

## 📊 方案对比总结

### 快速分享（推荐）
**选择 Vercel 或 Netlify**
- 5 分钟上线
- 完全免费
- 无需配置服务器

### 正式生产
**选择腾讯云/阿里云函数**
- 国内访问快
- 稳定性高
- 成本可控

### 学习实践
**选择 GitHub Pages + 云函数**
- 学习前后端分离
- 理解 Serverless 架构
- 完全免费

---

## 🔧 部署前准备

### 1. 火山引擎 API Key
确保你有有效的 API Key：
- 访问 [火山引擎](https://www.volcengine.com)
- 开通 doubao-seedream-5-0-260128 模型
- 创建推理接入点
- 获取 API Key

### 2. 环境变量
无论选择哪种方案，都需要配置以下环境变量：
```bash
VOLCANO_API_KEY=your_api_key_here
VOLCANO_MODEL=doubao-seedream-5-0-260128
VOLCANO_ENDPOINT=your_endpoint_here
```

### 3. 测试本地版本
部署前确保本地版本正常工作：
```bash
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js
# 访问 http://localhost:8000
```

---

## 📱 分享体验

部署完成后，你可以：
1. 将链接分享给朋友和同事
2. 收集反馈意见
3. 根据反馈优化功能
4. 考虑是否正式产品化

---

## ❓ 常见问题

### Q: 免费额度够用吗？
A: 对于 Demo 体验完全够用。Vercel 每月 100GB 流量，云函数每月 100 万次调用。

### Q: 需要备案吗？
A: 使用 Vercel/Netlify/GitHub Pages 不需要备案。使用国内云服务商需要备案。

### Q: 数据安全吗？
A: Demo 不存储用户上传的照片，只保存生成结果。生产环境建议添加用户系统和数据加密。

### Q: 可以自定义域名吗？
A: 所有方案都支持自定义域名。Vercel/Netlify 免费绑定，云函数需要额外配置。

---

## 🎯 推荐路线

**快速验证想法** → Vercel（5 分钟上线）
↓
**收集反馈优化** → 根据反馈迭代功能
↓
**正式产品化** → 腾讯云/阿里云函数计算
↓
**规模化运营** → 自有服务器 + 域名备案

---

**祝你部署顺利！** 🚀

如有问题，欢迎查看 `TROUBLESHOOTING.md` 或提 Issue。
