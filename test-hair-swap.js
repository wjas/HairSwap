require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const API_KEY = process.env.VOLCENGINE_API_KEY;
const MODEL = process.env.VOLCENGINE_MODEL || 'doubao-seedream-5-0-260128';
const BASE_URL = process.env.VOLCENGINE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

// 将本地图片转换为 base64
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

async function testHairSwap(photoPath, hairstylePath, testName) {
  console.log(`\n🔍 开始测试：${testName}...\n`);

  try {
    // 将本地图片转换为 base64
    const photoBase64 = imageToBase64(photoPath);
    const hairstyleBase64 = imageToBase64(hairstylePath);

    console.log('📤 上传图片...');
    console.log('   客户照片:', path.basename(photoPath));
    console.log('   发型模板:', path.basename(hairstylePath));

    const response = await axios.post(
      `${BASE_URL}/images/generations`,
      {
        model: MODEL,
        prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型，发际线自然，发色一致，高质量，逼真',
        image: [photoBase64, hairstyleBase64],
        size: '2K',
        sequential_image_generation: 'disabled',
        response_format: 'url',
        stream: false,
        watermark: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        timeout: 60000 // 60 秒超时
      }
    );

    console.log('\n✅ API 调用成功！');
    console.log('📄 响应数据:', JSON.stringify(response.data, null, 2));

    if (response.data.data && response.data.data[0]) {
      const imageUrl = response.data.data[0].url;
      console.log('\n🖼️ 生成的图片 URL:', imageUrl);
      console.log('💡 提示：在浏览器中打开此 URL 查看结果');
    }

    if (response.data.usage) {
      console.log('\n💰 使用统计:');
      console.log('   生成图片数:', response.data.usage.generated_images);
      console.log('   消耗 tokens:', response.data.usage.total_tokens);
    }

    return true;
  } catch (error) {
    console.error('\n❌ API 调用失败！');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNABORTED') {
      console.error('错误：请求超时（超过 60 秒），请稍后重试');
    } else {
      console.error('错误:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('💇 火山引擎换发型功能测试');
  console.log('='.repeat(60));

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('\n❌ 请先在 .env 文件中配置 VOLCENGINE_API_KEY！');
    process.exit(1);
  }

  console.log('\n📋 配置信息：');
  console.log('   Model:', MODEL);
  console.log('   API Base URL:', BASE_URL);

  // 使用 glob 查找文件
  console.log('\n📁 查找文件...');
  const baseDir = __dirname;

  const photoFiles = glob.sync('照片*.png', { cwd: baseDir });
  const hairstyleFiles = glob.sync('发型*.png', { cwd: baseDir });

  console.log('   找到的照片:', photoFiles);
  console.log('   找到的发型:', hairstyleFiles);

  if (photoFiles.length === 0 || hairstyleFiles.length === 0) {
    console.error('❌ 未找到测试图片文件！');
    process.exit(1);
  }

  const photoPath = path.join(baseDir, photoFiles[0]);
  const hairstyle1Path = path.join(baseDir, hairstyleFiles[0]);
  const hairstyle2Path = path.join(baseDir, hairstyleFiles[1] || hairstyleFiles[0]);

  console.log('\n   使用文件:');
  console.log(`     照片：${photoFiles[0]}`);
  console.log(`     发型 1: ${hairstyleFiles[0]}`);
  if (hairstyleFiles[1]) {
    console.log(`     发型 2: ${hairstyleFiles[1]}`);
  }

  // 第一次测试：照片 01 + 发型 01
  const test1Success = await testHairSwap(
    photoPath,
    hairstyle1Path,
    '照片 01 + 发型 01'
  );

  // 等待 3 秒再进行第二次测试
  if (test1Success) {
    console.log('\n⏳ 等待 3 秒后进行第二次测试...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 第二次测试：照片 01 + 发型 02
    const test2Success = await testHairSwap(
      photoPath,
      hairstyle2Path,
      '照片 01 + 发型 02'
    );

    console.log('\n' + '='.repeat(60));
    console.log('🎉 全部测试完成！');
    console.log('='.repeat(60));

    if (test1Success && test2Success) {
      console.log('\n✅ 两次换发型测试都成功了！');
    } else if (test1Success || test2Success) {
      console.log('\n⚠️ 部分测试成功，请检查失败的原因');
    } else {
      console.log('\n❌ 两次测试都失败了，请检查配置和图片质量');
    }
  }
}

main();
