#!/usr/bin/env python3
import shutil
import os

source_dir = '/Users/AS/codex-project/HairSwap'
dest_dir = '/Users/AS/codex-project/HairSwap/h5/images'

# 文件名没有空格
files = ['发型 01.png', '发型 02.png']

for file in files:
    source_path = os.path.join(source_dir, file)
    dest_path = os.path.join(dest_dir, file)
    
    if os.path.exists(source_path):
        shutil.copy2(source_path, dest_path)
        print(f'✅ 已复制：{file}')
    else:
        print(f'❌ 文件不存在：{file}')

print('\n完成！')
