/**
 * 测试 API - 检查图片格式
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testAPI() {
  const photoPath = path.resolve(__dirname, '..', '照片 01.png');
  const hairstylePath = path.resolve(__dirname, 'images', 'hairstyle1.png');
  
  console.log('📸 读取图片...');
  
  if (!fs.existsSync(photoPath)) {
    console.error('❌ 照片不存在');
    return;
  }
  
  if (!fs.existsSync(hairstylePath)) {
    console.error('❌ 发型不存在');
    return;
  }
  
  const photoBuffer = fs.readFileSync(photoPath);
  const hairstyleBuffer = fs.readFileSync(hairstylePath);
  
  const photoBase64 = photoBuffer.toString('base64');
  const hairstyleBase64 = hairstyleBuffer.toString('base64');
  
  console.log('✅ 图片读取成功');
  console.log('   照片大小:', (photoBuffer.length / 1024).toFixed(2), 'KB');
  console.log('   发型大小:', (hairstyleBuffer.length / 1024).toFixed(2), 'KB');
  
  // 读取 .env 文件
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env 文件不存在');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKey = envContent.match(/VOLCENGINE_API_KEY=(.+)/)?.[1]?.trim();
  
  if (!apiKey) {
    console.error('❌ 未找到 API Key');
    return;
  }
  
  console.log('\n📤 调用 API...');
  
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
        timeout: 60000
      }
    );
    
    console.log('✅ 生成成功！');
    console.log('   URL:', response.data.data[0].url);
  } catch (error) {
    console.error('❌ 生成失败');
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   错误:', error.message);
    }
  }
}

testAPI();
