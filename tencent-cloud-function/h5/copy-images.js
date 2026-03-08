const fs = require('fs');

// 使用 glob 查找文件
const files = fs.readdirSync('/Users/AS/codex-project/HairSwap')
  .filter(f => f.endsWith('.png') && f.includes('发型'));

console.log('找到的发型文件:', files);

files.forEach(file => {
  const src = `/Users/AS/codex-project/HairSwap/${file}`;
  const dest = `/Users/AS/codex-project/HairSwap/h5/images/${file}`;
  
  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 已复制：${file}`);
  } catch (err) {
    console.log(`❌ 复制失败 ${file}:`, err.message);
  }
});

console.log('\n完成！');
