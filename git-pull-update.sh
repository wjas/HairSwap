#!/bin/bash
# HairSwap 服务器端 Git 拉取更新脚本

SERVER_IP="106.52.29.87"

echo "🔄 HairSwap 服务器 Git 自动更新工具"
echo "=============================="
echo "目标服务器：$SERVER_IP"
echo ""

# 1. SSH 连接到服务器并执行更新
ssh root@$SERVER_IP << 'EOF'
echo "📦 开始更新..."
cd /root

# 1. 备份当前 h5 目录
echo "1. 备份当前状态..."
if [ -d "h5" ]; then
    cp -r h5 h5-backup-$(date +%Y%m%d_%H%M%S)
    echo "✅ 已备份"
fi

# 2. 更新 HairSwap Git 仓库
echo ""
echo "2. 更新 Git 仓库..."
cd /root/HairSwap
git fetch origin
git reset --hard origin/main
echo "✅ Git 仓库已更新"

# 3. 更新 h5 目录（保留 history 和 .env）
echo ""
echo "3. 更新 h5 目录..."
cd /root

# 临时保存重要文件
if [ -d "h5/history" ]; then
    mv h5/history /tmp/h5-history-temp
    echo "   - 历史记录已保存"
fi
if [ -f "h5/.env" ]; then
    cp h5/.env /tmp/h5-env-temp
    echo "   - .env 文件已保存"
fi

# 替换 h5 目录
rm -rf h5
cp -r HairSwap/h5 .

# 恢复重要文件
if [ -d "/tmp/h5-history-temp" ]; then
    mv /tmp/h5-history-temp h5/history
    echo "   - 历史记录已恢复"
fi
if [ -f "/tmp/h5-env-temp" ]; then
    cp /tmp/h5-env-temp h5/.env
    echo "   - .env 文件已恢复"
fi

# 清理临时文件
rm -f /tmp/h5-history-temp /tmp/h5-env-temp 2>/dev/null

echo "✅ h5 目录已更新"

# 4. 检查并安装依赖
echo ""
echo "4. 检查依赖..."
cd /root/HairSwap
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "   - 安装/更新 npm 依赖..."
    npm install
    cp -r node_modules /root/h5/
    echo "   ✅ 依赖已更新"
else
    echo "   - 依赖已是最新"
fi

# 5. 重启服务
echo ""
echo "5. 重启服务..."
pkill -9 -f test-server.js
pkill -9 -f "python3.*8000"
sleep 2

echo "   - 启动后端服务..."
cd /root/h5
nohup node test-server.js > test-server.log 2>&1 &

echo "   - 启动前端服务..."
nohup python3 -m http.server 8000 > /dev/null 2>&1 &

sleep 2

# 6. 验证服务状态
echo ""
echo "6. 验证服务状态..."
echo ""
echo "📊 进程状态："
BACKEND_PID=$(ps aux | grep "test-server.js" | grep -v grep | awk '{print $2}')
FRONTEND_PID=$(ps aux | grep "python3.*8000" | grep -v grep | awk '{print $2}')

if [ -n "$BACKEND_PID" ]; then
    echo "✅ 后端服务运行中 (PID: $BACKEND_PID)"
else
    echo "❌ 后端服务未启动"
fi

if [ -n "$FRONTEND_PID" ]; then
    echo "✅ 前端服务运行中 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端服务未启动"
fi

echo ""
echo "=============================="
echo "🎉 服务器更新完成！"
echo "访问地址：http://$SERVER_IP:8000/"
EOF
