#!/bin/bash
# HairSwap 服务重启脚本

echo "🔄 正在重启 HairSwap 服务..."

# 1. 杀掉旧进程
echo "📛 停止旧进程..."
pkill -9 -f test-server.js
pkill -9 -f "node.*3001"
sleep 2

# 2. 确认端口已释放
echo "🔍 检查 3001 端口..."
lsof -ti:3001 && echo "⚠️  3001 端口仍被占用" || echo "✅ 3001 端口已释放"

# 3. 启动新进程
echo "🚀 启动后端服务..."
cd /root/HairSwap/h5
nohup node test-server.js > test-server.log 2>&1 &
SERVER_PID=$!
echo "✅ 后端服务已启动 (PID: $SERVER_PID)"

# 4. 等待启动并查看日志
sleep 3
echo ""
echo "📋 服务启动日志:"
tail -20 test-server.log

# 5. 检查进程状态
echo ""
echo "📊 进程状态:"
ps aux | grep "test-server.js" | grep -v grep

echo ""
echo "✅ 服务重启完成！"
