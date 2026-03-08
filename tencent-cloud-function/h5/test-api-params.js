/**
 * 测试 API 参数格式
 * 根据火山引擎文档，image 参数可能是 URL 数组
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testAPIFormats() {
  const envPath = path.resolve(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKey = envContent.match(/VOLCENGINE_API_KEY=(.+)/)?.[1]?.trim();
  
  console.log('🧪 测试不同的 API 参数格式...\n');
  
  // 读取实际图片
  const photoPath = path.resolve(__dirname, '..', '照片 01.png');
  const hairstylePath = path.resolve(__dirname, 'images', 'hairstyle1.png');
  
  if (!fs.existsSync(photoPath) || !fs.existsSync(hairstylePath)) {
    console.log('❌ 图片文件不存在');
    return;
  }
  
  const photoBuffer = fs.readFileSync(photoPath);
  const hairstyleBuffer = fs.readFileSync(hairstylePath);
  
  const photoBase64 = `data:image/png;base64,${photoBuffer.toString('base64')}`;
  const hairstyleBase64 = `data:image/png;base64,${hairstyleBuffer.toString('base64')}`;
  
  console.log('照片大小:', (photoBuffer.length / 1024).toFixed(2), 'KB');
  console.log('发型大小:', (hairstyleBuffer.length / 1024).toFixed(2), 'KB');
  
  // 测试 1: image 为 base64 数组（带前缀）
  console.log('\n1️⃣  image: [base64, base64] (带前缀)');
  await testFormat(apiKey, [photoBase64, hairstyleBase64]);
  
  // 测试 2: image 为对象格式
  console.log('\n2️⃣  image: { prompt_image: base64, target_image: base64 }');
  await testFormatObject(apiKey, photoBase64, hairstyleBase64);
}

async function testFormat(apiKey, imageArray) {
  try {
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: 'doubao-seedream-5-0-260128',
        prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型',
        image: imageArray,
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
        timeout: 60000
      }
    );
    
    console.log('   ✅ 成功！');
    console.log('   URL:', response.data.data[0].url);
  } catch (error) {
    console.log('   ❌ 失败');
    if (error.response) {
      const msg = error.response.data?.error?.message || JSON.stringify(error.response.data);
      console.log('   错误:', msg.substring(0, 200));
    } else {
      console.log('   错误:', error.message);
    }
  }
}

async function testFormatObject(apiKey, photoBase64, hairstyleBase64) {
  try {
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: 'doubao-seedream-5-0-260128',
        prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型',
        image: {
          prompt_image: hairstyleBase64,
          target_image: photoBase64
        },
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
        timeout: 60000
      }
    );
    
    console.log('   ✅ 成功！');
    console.log('   URL:', response.data.data[0].url);
  } catch (error) {
    console.log('   ❌ 失败');
    if (error.response) {
      const msg = error.response.data?.error?.message || JSON.stringify(error.response.data);
      console.log('   错误:', msg.substring(0, 200));
    } else {
      console.log('   错误:', error.message);
    }
  }
}

testAPIFormats();
