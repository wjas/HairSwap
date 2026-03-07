/**
 * 测试不同的 base64 格式
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testFormats() {
  const envPath = path.resolve(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKey = envContent.match(/VOLCENGINE_API_KEY=(.+)/)?.[1]?.trim();
  
  const photoPath = path.resolve(__dirname, '..', '照片 01.png');
  const hairstylePath = path.resolve(__dirname, 'images', 'hairstyle1.png');
  
  if (!fs.existsSync(photoPath) || !fs.existsSync(hairstylePath)) {
    console.log('⚠️  图片文件不存在，使用测试图片');
    
    // 使用 1x1 像素的测试图片
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('\n📝 测试不同的 base64 格式...\n');
    
    // 格式 1: 纯 base64
    console.log('1️⃣  纯 base64（无前缀）');
    await testAPI(apiKey, testBase64, testBase64, '纯 base64');
    
    // 格式 2: 带 data URI 前缀
    console.log('\n2️⃣  带 data URI 前缀');
    await testAPI(apiKey, `data:image/png;base64,${testBase64}`, `data:image/png;base64,${testBase64}`, '带前缀');
    
  } else {
    console.log('✅ 读取实际图片');
    const photoBuffer = fs.readFileSync(photoPath);
    const hairstyleBuffer = fs.readFileSync(hairstylePath);
    
    const photoBase64 = photoBuffer.toString('base64');
    const hairstyleBase64 = hairstyleBuffer.toString('base64');
    
    console.log('   照片大小:', (photoBuffer.length / 1024).toFixed(2), 'KB');
    console.log('   发型大小:', (hairstyleBuffer.length / 1024).toFixed(2), 'KB');
    
    console.log('\n1️⃣  纯 base64（无前缀）');
    await testAPI(apiKey, photoBase64, hairstyleBase64, '实际图片 - 纯 base64');
  }
}

async function testAPI(apiKey, photoBase64, hairstyleBase64, label) {
  try {
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: 'doubao-seedream-5-0-260128',
        prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型',
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
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    );
    
    console.log(`   ✅ ${label} - 成功`);
    console.log('   URL:', response.data.data[0].url);
  } catch (error) {
    console.log(`   ❌ ${label} - 失败`);
    if (error.response) {
      const msg = error.response.data?.error?.message || JSON.stringify(error.response.data);
      console.log('   错误:', msg.substring(0, 100));
    } else {
      console.log('   错误:', error.message);
    }
  }
}

testFormats();
