# 历史记录保存说明 📁

## 📍 保存位置

所有生成的历史记录都保存在服务器文件系统中：

```
/Users/AS/codex-project/HairSwap/h5/history/
├── 1234567890/          # 记录 ID（时间戳）
│   ├── metadata.json    # 元数据
│   ├── original.png     # 原图
│   └── result.png       # 生成图
├── 1234567891/
│   ├── metadata.json
│   ├── original.png
│   └── result.png
└── ...
```

## 📊 文件说明

### metadata.json
记录基本信息：
```json
{
  "id": 1234567890,
  "hairstyleName": "发型 1",
  "createdAt": "2026-03-07T10:30:00.000Z"
}
```

### original.png
- 用户上传的原始照片
- PNG 格式
- 保留 EXIF 信息

### result.png
- AI 生成的换发后照片
- PNG 格式
- 高质量输出

## 🔄 工作流程

```
用户上传照片 → 选择发型 → 点击生成
    ↓
调用火山引擎 API
    ↓
生成成功
    ↓
自动保存到 h5/history/记录 ID/
    ├─ metadata.json
    ├─ original.png
    └─ result.png
    ↓
显示结果页面
```

## 💾 存储优势

### ✅ 不再使用 localStorage
- ❌ localStorage 限制：5-10MB
- ✅ 文件系统：无限制（取决于磁盘空间）
- ✅ 永久保存，不受浏览器缓存影响
- ✅ 易于备份和管理

### ✅ 自动保存
- 每次生成成功后自动保存
- 无需手动操作
- 保存失败不影响显示结果

## 📂 管理历史记录

### 查看记录
直接访问文件夹：
```bash
cd /Users/AS/codex-project/HairSwap/h5/history
ls -la
```

### 备份记录
```bash
# 复制整个历史记录文件夹
cp -r /Users/AS/codex-project/HairSwap/h5/history /备份位置/
```

### 删除记录
```bash
# 删除单条记录
rm -rf /Users/AS/codex-project/HairSwap/h5/history/1234567890

# 删除所有记录
rm -rf /Users/AS/codex-project/HairSwap/h5/history/*
```

## 🌐 服务器配置

### 启动测试服务器
```bash
cd /Users/AS/codex-project/HairSwap/h5
node test-server.js
```

### 服务端口
- **Web 服务**: 8000 (Nginx)
- **API 服务**: 3001 (Node.js)
- **保存接口**: http://localhost:3001/save-history

## 📱 使用说明

1. **访问页面**: http://192.168.2.60:8000
2. **上传照片**: 点击上传区域
3. **选择发型**: 从发型列表中选择
4. **点击生成**: 等待 AI 生成
5. **查看结果**: 生成成功后自动显示
6. **历史记录**: 点击"生成记录"查看保存位置提示

## ⚠️ 注意事项

1. **不要删除 history 文件夹**
   - 所有历史记录都在此文件夹
   - 删除后无法恢复

2. **定期备份**
   - 建议定期备份 history 文件夹
   - 可以复制到外部存储或云盘

3. **磁盘空间**
   - 每条记录约 2-6MB
   - 注意监控磁盘空间

4. **隐私保护**
   - 历史记录包含用户照片
   - 请妥善保管，避免泄露

---

**最后更新**: 2026-03-07
