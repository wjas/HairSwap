import os

image_dir = '/Users/AS/codex-project/HairSwap/h5/images'

files = {
    '发型 01.png': 'hairstyle1.png',
    '发型 02.png': 'hairstyle2.png',
    '发型 03.png': 'hairstyle3.png',
    '发型 04.png': 'hairstyle4.png'
}

print('📁 重命名发型文件...\n')

for old_name, new_name in files.items():
    old_path = os.path.join(image_dir, old_name)
    new_path = os.path.join(image_dir, new_name)
    
    if os.path.exists(old_path):
        try:
            os.rename(old_path, new_path)
            print(f'✅ {old_name} → {new_name}')
        except Exception as e:
            print(f'❌ {old_name} 重命名失败：{e}')
    else:
        print(f'⚠️  {old_name} 不存在')

print('\n完成！')
