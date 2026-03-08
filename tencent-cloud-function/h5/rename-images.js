const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'images');
const files = [
  { from: '发型 01.png', to: 'hairstyle1.png' },
  { from: '发型 02.png', to: 'hairstyle2.png' },
  { from: '发型 03.png', to: 'hairstyle3.png' },
  { from: '发型 04.png', to: 'hairstyle4.png' }
];

console.log('📁 重命名发型文件...\n');

files.forEach(file => {
  const fromPath = path.join(imageDir, file.from);
  const toPath = path.join(imageDir, file.to);
  
  if (fs.existsSync(fromPath)) {
    try {
      fs.renameSync(fromPath, toPath);
      console.log(`✅ ${file.from} → ${file.to}`);
    } catch (err) {
      console.log(`❌ ${file.from} 重命名失败：${err.message}`);
    }
  } else {
    console.log(`⚠️  ${file.from} 不存在`);
  }
});

console.log('\n完成！');
