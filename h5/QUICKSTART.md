# 🚀 HairSwap H5 快速启动

## ✅ 服务已启动！

### 当前状态
- ✅ API 服务器：运行在端口 3000
- ✅ 前端服务器：运行在端口 8000

### 访问地址
**http://localhost:8000**

---

## 📱 使用步骤

1. **打开浏览器**
   - 访问 http://localhost:8000
   - 按 F12 打开开发者工具（可选，用于查看日志）

2. **上传照片**
   - 点击"上传照片"区域
   - 选择照片文件（照片 01.png）
   - 确认预览显示正常

3. **选择发型**
   - 点击 4 个发型卡片之一
   - 选中后会有✓标记

4. **生成效果**
   - 点击"立即生成"按钮
   - 进入加载页面
   - 等待 10-20 秒

5. **查看结果**
   - 生成成功后显示新发型照片
   - 可以保存图片或重新生成

---

## 🔧 如果图片无法显示

### 发型模板不显示？

**原因**：浏览器对中文文件名的 URL 编码问题

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签的错误信息
3. 如果看到 404 错误，尝试以下方法：

**方法 1**：重命名文件为英文
```bash
cd /Users/AS/codex-project/HairSwap/h5/images
mv 发型 01.png hairstyle1.png
mv 发型 02.png hairstyle2.png
mv 发型 03.png hairstyle3.png
mv 发型 04.png hairstyle4.png
```

然后修改 `js/app.js`：
```javascript
hairstyleMap: {
  'style1': 'hairstyle1.png',
  'style2': 'hairstyle2.png',
  'style3': 'hairstyle3.png',
  'style4': 'hairstyle4.png'
}
```

**方法 2**：使用 base64 内联图片（推荐用于测试）

---

## 🛑 停止服务

需要停止时使用：

```bash
# 停止 API 服务器
lsof -ti:3000 | xargs kill -9

# 停止前端服务器
lsof -ti:8000 | xargs kill -9
```

---

## 💡 常见问题

### Q: "本地服务未启动或生成失败"
**A**: 
1. 确认两个服务都在运行
2. 强制刷新浏览器（Cmd+Shift+R）
3. 查看浏览器控制台错误

### Q: 图片 404 错误
**A**: 
- 文件名包含中文，浏览器 URL 编码问题
- 建议重命名为英文文件名

### Q: 端口被占用
**A**: 
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

---

## 📊 测试数据

- **照片**：照片 01.png（约 2.3MB）
- **发型模板**：4 个（约 3.7-4.9MB 每个）
- **生成成本**：0.22 元/张
- **预计时间**：10-20 秒

---

## 🎯 下一步

测试完成后：
1. 查看生成结果
2. 保存图片
3. 如需部署到生产环境，参考 DEPLOYMENT.md
