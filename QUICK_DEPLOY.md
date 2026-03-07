# 🚀 HairSwap 快速部署指南（5 分钟上线）

本指南帮助你**最快 5 分钟**将 HairSwap Demo 部署到互联网，分享给朋友和同事体验。

---

## 📋 准备工作

### 1. GitHub 账号
- 如果没有，访问 [github.com](https://github.com) 注册

### 2. Vercel 账号
- 访问 [vercel.com](https://vercel.com)
- 使用 GitHub 账号登录

### 3. 火山引擎 API Key
- 访问 [火山引擎](https://www.volcengine.com)
- 开通 doubao-seedream-5-0-260128 模型
- 创建推理接入点
- 获取 API Key

---

## 🎯 部署步骤

### 步骤 1：上传代码到 GitHub（2 分钟）

```bash
# 进入项目目录
cd /Users/AS/codex-project/HairSwap

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "HairSwap v1.2.0 - AI 换发型 Demo"

# 在 GitHub 上创建新仓库（访问 https://github.com/new）
# 仓库名：HairSwap
# 可见性：Public 或 Private

# 关联远程仓库并推送
git remote add origin https://github.com/你的用户名/HairSwap.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 导入项目（1 分钟）

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Add New Project"**
3. 选择 **"Import Git Repository"**
4. 选择 **HairSwap** 仓库
5. 点击 **"Import"**

### 步骤 3：配置环境变量（1 分钟）

1. 在 Vercel 项目页面，点击 **"Settings"**
2. 点击 **"Environment Variables"**
3. 添加以下环境变量：

```
VOLCANO_API_KEY=你的火山引擎 API Key
VOLCANO_MODEL=doubao-seedream-5-0-260128
VOLCANO_ENDPOINT=你的 API 接入点地址
```

4. 点击 **"Save"**

### 步骤 4：等待部署完成（1 分钟）

- Vercel 会自动构建并部署
- 看到 **"Ready"** 状态表示部署成功
- 获得免费域名：`https://hairswap-xxx.vercel.app`

---

## 🌐 访问和分享

### 访问你的 Demo
打开浏览器访问：
```
https://hairswap-xxx.vercel.app
```

### 分享给朋友
将链接发送给朋友和同事：
- 微信分享
- QQ 分享
- 邮件分享

### 收集反馈
准备一个反馈收集方式：
- 微信群
- 腾讯文档
- 问卷星

---

## ⚙️ 进阶配置

### 自定义域名（可选）

1. 在 Vercel 项目设置中点击 **"Domains"**
2. 添加你的域名
3. 按照提示配置 DNS
4. 等待 DNS 生效（最多 24 小时）

### 前端 API 配置

如果需要修改 API 地址，编辑 `h5/js/config.js`：

```javascript
const API_BASE_URL = 'https://hairswap-xxx.vercel.app/api';
```

### 查看部署日志

1. 在 Vercel 项目页面点击 **"Deployments"**
2. 点击最新的部署
3. 查看 **"Functions"** 日志

---

## 💰 成本和限制

### Vercel 免费额度
- ✅ 每月 100GB 流量
- ✅ 每月 100 万秒函数执行时间
- ✅ 自动 HTTPS 证书
- ✅ 全球 CDN 加速

### 火山引擎成本
- ✅ 新用户 100 次免费调用
- 💰 超出后约 0.22 元/张

**对于 Demo 体验完全够用！**

---

## 🔄 更新代码

每次推送代码到 GitHub，Vercel 会自动重新部署：

```bash
# 修改代码后
git add .
git commit -m "修复 xxx 问题"
git push
```

Vercel 会自动：
1. 检测到代码更新
2. 重新构建
3. 自动部署
4. 无缝切换

---

## ❓ 常见问题

### Q: 部署失败怎么办？
A: 查看 Vercel 部署日志，通常是环境变量配置错误。

### Q: 访问速度慢怎么办？
A: Vercel 使用全球 CDN，国内访问可能需要几秒。可以考虑国内云服务商。

### Q: 需要备案吗？
A: 使用 Vercel 的免费域名不需要备案。绑定国内域名需要备案。

### Q: API Key 会泄露吗？
A: 不会。环境变量存储在 Vercel 服务器端，前端代码无法访问。

### Q: 可以删除重新部署吗？
A: 可以。在 Vercel 项目设置中点击 **"Delete Project"**，然后重新部署。

---

## 📱 测试清单

部署完成后，请测试以下功能：

- [ ] 打开页面能正常加载
- [ ] 上传照片功能正常
- [ ] 选择发型功能正常
- [ ] AI 生成功能正常
- [ ] 结果展示正常
- [ ] 保存图片功能正常
- [ ] 历史记录功能正常
- [ ] 手机端显示正常
- [ ] 拍照/相册按钮正常

---

## 🎉 部署完成！

现在你可以：
1. ✅ 将链接分享给朋友
2. ✅ 收集使用反馈
3. ✅ 根据反馈优化功能
4. ✅ 考虑是否正式产品化

**祝你使用愉快！** 🚀

---

## 📚 更多资源

- [完整部署方案对比](DEPLOYMENT_OPTIONS.md)
- [故障排查指南](TROUBLESHOOTING.md)
- [技术文档](TECHNICAL_DOCS.md)
- [项目说明](README.md)
