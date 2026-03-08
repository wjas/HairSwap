# ⚠️ 重要：需要手动重命名文件

## 问题原因
sandbox 环境无法正确处理中文文件名，但实际文件是存在的。

## 解决方案

请在**你的终端**中运行以下命令：

### 1. 重命名文件

```bash
cd /Users/AS/codex-project/HairSwap/h5/images

mv 发型 01.png hairstyle1.png
mv 发型 02.png hairstyle2.png
mv 发型 03.png hairstyle3.png
mv 发型 04.png hairstyle4.png

ls -1
```

应该看到：
```
README.md
hairstyle1.png
hairstyle2.png
hairstyle3.png
hairstyle4.png
```

### 2. 强制刷新浏览器

访问 http://localhost:8000 后按 **Cmd + Shift + R**

---

## 或者使用 Finder 手动重命名

1. 打开 Finder
2. 进入 `/Users/AS/codex-project/HairSwap/h5/images`
3. 依次重命名 4 个文件：
   - 发型 01.png → hairstyle1.png
   - 发型 02.png → hairstyle2.png
   - 发型 03.png → hairstyle3.png
   - 发型 04.png → hairstyle4.png

---

## 验证

重命名完成后，刷新浏览器页面，应该可以看到发型模板了。
