#!/bin/bash
# HairSwap 本地 Git 提交推送脚本

echo "📦 HairSwap Git 自动更新工具"
echo "=============================="

# 1. 检查 git 状态
echo "1. 检查 Git 状态..."
cd /Users/AS/codex-project/HairSwap

if [ -z "$(git status --porcelain)" ]; then
    echo "⚠️  没有文件被修改，无需提交"
    exit 0
fi

# 2. 添加所有修改的文件
echo ""
echo "2. 添加修改的文件..."
git add -u
echo "✅ 文件已添加"

# 3. 显示变更
echo ""
echo "3. 即将提交的变更："
git diff --cached --name-status

# 4. 提交
echo ""
read -p "请输入提交信息（默认：Update）: " commit_msg
commit_msg=${commit_msg:-Update}

echo ""
echo "4. 提交代码..."
git commit -m "$commit_msg"

if [ $? -ne 0 ]; then
    echo "❌ 提交失败"
    exit 1
fi

echo "✅ 提交成功"

# 5. 推送到远程
echo ""
echo "5. 推送到远程仓库..."
git push

if [ $? -ne 0 ]; then
    echo "❌ 推送失败"
    exit 1
fi

echo "✅ 推送成功"

echo ""
echo "=============================="
echo "🎉 本地更新完成！"
echo ""
echo "下一步：在腾讯云服务器上运行 git-pull-update.sh"
