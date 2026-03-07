# 🚀 Vercel 部署检查清单

## ✅ 部署前准备

### 1. GitHub 仓库
- [x] Git 仓库已初始化
- [x] 最新代码已提交（v1.2.0）
- [ ] 创建 GitHub 仓库
- [ ] 推送代码到 GitHub

### 2. Vercel 账号
- [ ] 访问 [vercel.com](https://vercel.com)
- [ ] 使用 GitHub 账号登录

### 3. 火山引擎 API Key
- [ ] 获取 API Key
- [ ] 获取 API 接入点地址

---

## 📝 部署步骤（5 分钟）

### 步骤 1：推送代码到 GitHub（2 分钟）

```bash
# 1. 在 GitHub 上创建新仓库
# 访问：https://github.com/new
# 仓库名：HairSwap
# 可见性：Public 或 Private（建议 Public 方便分享）
# 不要勾选"Initialize this repository with a README"

# 2. 推送代码到 GitHub
cd /Users/AS/codex-project/HairSwap
git remote add origin https://github.com/你的用户名/HairSwap.git
git branch -M main
git push -u origin main
```

**✅ 检查项**：
- [ ] 代码成功推送到 GitHub
- [ ] 能在 GitHub 上看到所有文件

---

### 步骤 2：Vercel 导入项目（1 分钟）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 **"Add New Project"**
   - 选择 **"Import Git Repository"**

3. **选择仓库**
   - 在列表中找到 **HairSwap**
   - 点击 **"Import"**

**✅ 检查项**：
- [ ] 成功进入项目配置页面
- [ ] Framework Preset 显示为 "Other"

---

### 步骤 3：配置环境变量（1 分钟）

**重要！先不要点击 Deploy，先配置环境变量**

1. 点击 **"Continue"**
2. 点击 **"Environment Variables"** 展开
3. 添加以下 3 个环境变量：

```
Name: VOLCANO_API_KEY
Value: 你的火山引擎 API Key
（点击 Add）

Name: VOLCANO_MODEL
Value: doubao-seedream-5-0-260128
（点击 Add）

Name: VOLCANO_ENDPOINT
Value: 你的 API 接入点地址
（点击 Add）
```

4. 确认 3 个变量都已添加
5. 点击 **"Deploy"**

**✅ 检查项**：
- [ ] VOLCANO_API_KEY 已配置
- [ ] VOLCANO_MODEL 已配置
- [ ] VOLCANO_ENDPOINT 已配置

---

### 步骤 4：等待部署完成（1 分钟）

1. Vercel 开始构建
2. 查看部署日志（可选）
3. 看到 **"Ready"** 状态表示成功
4. 获得域名：`https://hairswap-xxx.vercel.app`

**✅ 检查项**：
- [ ] 部署状态显示 "Ready"
- [ ] 能看到预览域名
- [ ] 点击 "Visit" 能打开页面

---

## 🎯 部署后测试

### 访问测试
```bash
# 在浏览器打开 Vercel 提供的域名
https://hairswap-xxx.vercel.app
```

### 功能测试清单
- [ ] 页面能正常加载
- [ ] 能看到"选择发型"标题
- [ ] 手机端显示"拍照"和"选择图片"按钮
- [ ] 桌面端显示上传区域
- [ ] 上传照片功能正常
- [ ] 选择发型功能正常
- [ ] AI 生成按钮可点击
- [ ] 生成结果正常显示
- [ ] 保存图片功能正常
- [ ] 历史记录功能正常

---

## 🔧 常见问题

### Q1: 部署失败怎么办？
**解决方案**：
1. 查看 Vercel 部署日志
2. 检查环境变量是否正确
3. 确认 API Key 有效
4. 重新部署（点击 "Redeploy"）

### Q2: 生成图片失败？
**解决方案**：
1. 检查火山引擎 API Key 是否正确
2. 检查 API 接入点是否开通
3. 查看 Vercel Functions 日志
4. 确认免费额度未用完

### Q3: 访问速度慢？
**解决方案**：
- Vercel 使用全球 CDN，国内首次访问可能需要 3-5 秒
- 等待几秒即可
- 可以考虑绑定国内域名加速

### Q4: 如何查看 API 调用日志？
**解决方案**：
1. 在 Vercel 项目页面点击 "Functions"
2. 选择最新的部署
3. 查看函数执行日志

---

## 📱 分享链接

部署成功后，你可以：

### 获取分享链接
```
https://hairswap-xxx.vercel.app
（xxx 是你的仓库名随机后缀）
```

### 分享渠道
- [ ] 微信朋友圈
- [ ] 微信好友
- [ ] QQ 群
- [ ] 微博
- [ ] 邮件

### 收集反馈
准备一个反馈收集方式：
- 微信群
- 腾讯文档在线表格
- 问卷星链接

---

## 💰 成本说明

### Vercel 免费额度
- ✅ 每月 100GB 流量（足够）
- ✅ 每月 100 万秒函数执行（足够）
- ✅ 自动 HTTPS 证书
- ✅ 全球 CDN 加速
- ✅ 自动部署

### 火山引擎成本
- ✅ 新用户 100 次免费调用
- 💰 超出后约 0.22 元/张

**对于 Demo 体验完全免费！**

---

## 🔄 后续更新

每次修改代码后自动部署：

```bash
# 修改代码后
git add .
git commit -m "修复 xxx 问题"
git push
```

Vercel 会自动：
1. 检测到代码更新
2. 重新构建部署
3. 无缝切换（零停机）

---

## 📊 监控和统计

### 查看访问统计
1. 访问 Vercel 项目页面
2. 点击 "Analytics"
3. 查看访问量、地区分布等

### 查看函数调用
1. 点击 "Functions"
2. 查看调用次数、执行时间
3. 监控错误日志

---

## ✅ 完成！

部署成功后，记得：
- [ ] 测试所有功能
- [ ] 分享给朋友体验
- [ ] 收集反馈意见
- [ ] 根据反馈优化功能

**祝你部署顺利！** 🚀

---

## 📚 相关文档
- [完整部署方案](DEPLOYMENT_OPTIONS.md)
- [快速部署指南](QUICK_DEPLOY.md)
- [故障排查](TROUBLESHOOTING.md)
- [技术文档](TECHNICAL_DOCS.md)
