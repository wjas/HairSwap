require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.VOLCENGINE_API_KEY;
const MODEL = process.env.VOLCENGINE_MODEL || 'doubao-seedream-5.0-lite';
const BASE_URL = process.env.VOLCENGINE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

async function testTextToImage() {
  console.log('🔍 测试文生图功能...\n');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/images/generations`,
      {
        model: MODEL,
        prompt: '一只可爱的卡通猫咪坐在草地上，阳光明媚，色彩鲜艳',
        size: '2048x2048',
        sequential_image_generation: 'disabled',
        response_format: 'url'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    console.log('✅ API 调用成功！');
    console.log('📄 响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data[0]) {
      const imageUrl = response.data.data[0].url;
      console.log('\n🖼️ 生成的图片 URL:', imageUrl);
    }
    
    return true;
  } catch (error) {
    console.error('❌ API 调用失败！');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('错误:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('=' .repeat(50));
  console.log('🚀 火山引擎 doubao-seedream API 测试');
  console.log('=' .repeat(50), '\n');
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('❌ 请先在 .env 文件中配置 VOLCENGINE_API_KEY！');
    console.log('💡 步骤：');
    console.log('   1. 复制 .env.example 为 .env');
    console.log('   2. 填入你的火山引擎 API Key');
    console.log('   3. 再次运行 npm test');
    process.exit(1);
  }
  
  console.log('📋 配置信息：');
  console.log('   Model:', MODEL);
  console.log('   API Base URL:', BASE_URL);
  console.log('');
  
  const success = await testTextToImage();
  
  console.log('\n' + '=' .repeat(50));
  if (success) {
    console.log('🎉 测试完成！API 可用！');
  } else {
    console.log('❌ 测试失败，请检查配置。');
  }
  console.log('=' .repeat(50));
}

main();
