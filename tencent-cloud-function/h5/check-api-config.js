/**
 * 检查 API 配置
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

console.log('🔍 检查 API 配置...\n');

// 1. 检查 .env 文件
const envPath = path.resolve(__dirname, '..', '.env');
console.log('1. 检查 .env 文件');
if (!fs.existsSync(envPath)) {
  console.error('   ❌ .env 文件不存在');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/VOLCENGINE_API_KEY=(.+)/);

if (!apiKeyMatch) {
  console.error('   ❌ 未找到 VOLCENGINE_API_KEY');
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
console.log('   ✅ API Key 存在');
console.log('   密钥:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));

// 2. 检查模型配置
const model = 'doubao-seedream-5-0-260128';
console.log('\n2. 检查模型配置');
console.log('   ✅ 模型:', model);

// 3. 测试 API 连接
async function testAPI() {
  console.log('\n3. 测试 API 连接...');
  
  try {
    // 使用一个简单的测试图片（1x1 像素）
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/images/generations',
      {
        model: model,
        prompt: 'test',
        image: [testImage, testImage],
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
    
    console.log('   ✅ API 连接成功');
    console.log('   响应状态:', response.status);
  } catch (error) {
    console.error('   ❌ API 连接失败');
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   错误信息:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n   💡 API Key 无效或已过期');
      } else if (error.response.status === 400) {
        console.error('\n   💡 请求参数错误，可能是模型未开通或参数格式不对');
      }
    } else {
      console.error('   错误:', error.message);
    }
    process.exit(1);
  }
  
  console.log('\n✅ 所有检查通过！');
}

testAPI();
