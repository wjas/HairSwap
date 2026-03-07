# HairSwap H5 本地测试指南

## 快速开始

### 方式一：使用本地测试服务器（推荐）

适合开发阶段，可以直接调用火山引擎 API 进行测试。

#### 1. 准备发型模板

```bash
cd /Users/AS/codex-project/HairSwap/h5
cp ../发型 01.png images/
cp ../发型 02.png images/
```

#### 2. 启动本地测试服务器

```bash
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js
```

看到以下输出表示成功：
```
🚀 HairSwap 本地测试服务器
📍 端口：3000
🔧 API Key: 已配置
✅ 服务器运行中
🌐 前端访问：http://localhost:8000
🔌 API 地址：http://localhost:3000/generate
```

#### 3. 启动前端服务器（另一个终端）

```bash
cd /Users/AS/codex-project/HairSwap/h5
python3 -m http.server 8000
```

#### 4. 访问测试

打开浏览器访问：http://localhost:8000

现在可以：
1. 上传照片
2. 选择发型
3. 点击"立即生成"
4. 等待 10-20 秒
5. 查看结果

---

### 方式二：直接修改配置使用云函数

如果你已经部署了云函数：

1. 修改 `h5/js/app.js`：
```javascript
this.config = {
  apiBaseUrl: 'https://你的云函数地址',
  useMockMode: false
};
```

2. 直接访问前端页面即可

---

## 配置说明

### .env 文件

确保项目根目录的 `.env` 文件包含：

```env
VOLCENGINE_API_KEY=bbb3102e-6d74-4607-823c-573fbe2e7581
VOLCENGINE_MODEL=doubao-seedream-5-0-260128
VOLCENGINE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

### app.js 配置

```javascript
this.config = {
  maxFileSize: 10 * 1024 * 1024,
  apiBaseUrl: '', // 留空表示使用本地测试模式
  useMockMode: true, // true=本地测试，false=云函数模式
  hairstyleMap: {
    'style1': 'images/发型 01.png',
    'style2': 'images/发型 02.png'
  }
};
```

---

## 常见问题

### Q: "本地服务未启动或生成失败"
**A:** 确保已启动 `test-server.js`：
```bash
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js
```

### Q: "API Key 未配置"
**A:** 检查 `.env` 文件是否存在并包含正确的 API Key

### Q: "发型模板文件不存在"
**A:** 将发型图片复制到 `h5/images/` 目录：
```bash
cp ../发型 01.png images/
cp ../发型 02.png images/
```

### Q: "Failed to fetch"
**A:** 
1. 检查 `test-server.js` 是否运行在 3000 端口
2. 检查 `app.js` 中 `useMockMode` 是否为 `true`
3. 检查浏览器控制台错误信息

---

## 测试流程

1. **上传照片**
   - 点击上传区域
   - 选择照片或拍照
   - 确认预览正确

2. **选择发型**
   - 点击发型模板
   - 确认有选中标记

3. **生成结果**
   - 点击"立即生成"
   - 进入加载页面
   - 等待 10-20 秒
   - 查看生成结果

4. **保存结果**
   - 点击"保存图片"
   - 或长按图片保存

---

## 部署到生产环境

完成测试后，部署到生产环境：

1. **部署云函数**（详见 DEPLOYMENT.md）
2. **修改配置**：
   ```javascript
   this.config = {
     apiBaseUrl: 'https://你的云函数地址',
     useMockMode: false
   };
   ```
3. **测试完整流程**
4. **上线发布**

---

## 成本说明

- **本地测试**：使用火山引擎 API，0.22 元/张
- **云函数**：前 100 万次调用免费，单次成本约 0.0001 元
- **生产环境**：总计约 0.22 元/张

---

## 技术支持

- [火山引擎方舟文档](https://www.volcengine.com/docs/82379/1541523)
- [云函数部署指南](./DEPLOYMENT.md)
- [H5 使用指南](./README.md)
