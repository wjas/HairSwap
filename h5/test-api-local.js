/**
 * 测试本地 API 服务器
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testGenerate() {
  // 文件名没有空格
  const photoPath = path.resolve(__dirname, '..', '照片 01.png');
  const hairstylePath = path.resolve(__dirname, 'images', '发型 01.png');
  
  console.log('📸 读取测试图片...');
  console.log('   照片:', photoPath);
  console.log('   发型:', hairstylePath);
  
  // 检查文件是否存在
  const photoExists = fs.existsSync(photoPath);
  const hairstyleExists = fs.existsSync(hairstylePath);
  
  console.log('   照片存在:', photoExists);
  console.log('   发型存在:', hairstyleExists);
  
  if (!photoExists || !hairstyleExists) {
    console.error('❌ 文件不存在');
    return;
  }
  
  // 读取图片
  const photoBuffer = fs.readFileSync(photoPath);
  const hairstyleBuffer = fs.readFileSync(hairstylePath);
  
  console.log('✅ 图片读取成功');
  console.log('   照片大小:', (photoBuffer.length / 1024 / 1024).toFixed(2), 'MB');
  console.log('   发型大小:', (hairstyleBuffer.length / 1024 / 1024).toFixed(2), 'MB');
  
  const photoBase64 = photoBuffer.toString('base64');
  
  console.log('\n📤 发送到 API 服务器...');
  
  try {
    const response = await axios.post(
      'http://localhost:3000/generate',
      {
        photoBase64: photoBase64,
        hairstylePath: 'images/发型 01.png',
        prompt: '请保持脸部、五官、背景不变，仅将发型替换为参考图中的发型'
      },
      {
        timeout: 60000
      }
    );
    
    console.log('✅ 生成成功！');
    console.log('   图片 URL:', response.data.imageUrl);
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

testGenerate();
