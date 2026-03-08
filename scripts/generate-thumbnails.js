const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

async function generateThumbnail(inputPath, outputPath, width = THUMBNAIL_WIDTH) {
  try {
    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toFile(outputPath);
    console.log(`✅ 生成缩略图: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ 生成缩略图失败 ${inputPath}:`, error.message);
    return false;
  }
}

async function generateHistoryThumbnails(historyDir) {
  console.log(`\n📋 处理历史记录目录: ${historyDir}`);
  
  if (!fs.existsSync(historyDir)) {
    console.log('⚠️  历史记录目录不存在');
    return;
  }

  const folders = fs.readdirSync(historyDir)
    .filter(f => !f.startsWith('.') && !f.endsWith('.md') && !f.endsWith('.sh'))
    .map(f => path.join(historyDir, f))
    .filter(f => fs.statSync(f).isDirectory());

  let count = 0;
  for (const folder of folders) {
    const resultPath = path.join(folder, 'result.png');
    const thumbPath = path.join(folder, 'result_thumb.jpg');
    
    if (fs.existsSync(resultPath) && !fs.existsSync(thumbPath)) {
      const success = await generateThumbnail(resultPath, thumbPath);
      if (success) count++;
    }
  }
  
  console.log(`\n✅ 历史记录缩略图生成完成: ${count} 张`);
}

async function generateHairstyleThumbnails(imagesDir) {
  console.log(`\n📋 处理发型模板目录: ${imagesDir}`);
  
  if (!fs.existsSync(imagesDir)) {
    console.log('⚠️  发型模板目录不存在');
    return;
  }

  const files = fs.readdirSync(imagesDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
    .filter(f => !f.endsWith('_thumb.png'));

  let count = 0;
  for (const file of files) {
    const inputPath = path.join(imagesDir, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const thumbPath = path.join(imagesDir, `${baseName}_thumb.jpg`);
    
    if (!fs.existsSync(thumbPath)) {
      const success = await generateThumbnail(inputPath, thumbPath);
      if (success) count++;
    }
  }
  
  console.log(`\n✅ 发型模板缩略图生成完成: ${count} 张`);
}

async function main() {
  console.log('🎨 开始生成缩略图...');
  
  const historyDir = path.join(__dirname, '../h5/history');
  const imagesDir = path.join(__dirname, '../h5/images');
  
  await generateHistoryThumbnails(historyDir);
  await generateHairstyleThumbnails(imagesDir);
  
  console.log('\n🎉 所有缩略图生成完成！');
}

main().catch(console.error);
