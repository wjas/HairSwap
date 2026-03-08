#!/bin/bash
# 启动 HairSwap 前端服务器

echo "🌐 启动 HairSwap 前端服务器..."
echo "访问地址：http://localhost:8000"
cd /Users/AS/codex-project/HairSwap/h5
python3 -m http.server 8000
