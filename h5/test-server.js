/**
 * HairSwap 本地测试服务器
 * 
 * 用途：在开发阶段提供本地 API 调用服务
 * 启动：node test-server.js
 * 访问：http://localhost:3000 或 http://[内网IP]:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const PORT = 3001;
const HOST = '0.0.0.0'; // 允许局域网访问
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

// 从 .env 文件读取配置
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

const CONFIG = {
  VOLCENGINE_API_KEY: process.env.VOLCENGINE_API_KEY,
  VOLCENGINE_MODEL: 'doubao-seedream-5-0-260128',
  VOLCENGINE_BASE_URL: 'https://ark.cn-beijing.volces.com/api/v3'
};

console.log('🚀 HairSwap 本地测试服务器');
console.log('📍 端口:', PORT);
console.log('🔧 API Key:', CONFIG.VOLCENGINE_API_KEY ? '已配置' : '⚠️ 未配置');
console.log('');

const server = http.createServer(async (req, res) => {
  // 设置 CORS - 允许所有来源和方法
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/generate') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { photoBase64, hairstylePath, prompt } = JSON.parse(body);

        console.log('📥 收到生成请求');
        console.log('   发型模板:', hairstylePath);
        console.log('   照片 Base64 长度:', photoBase64 ? photoBase64.length : 0);

        // 检查必需参数
        if (!photoBase64) {
          throw new Error('缺少 photoBase64 参数');
        }

        if (!hairstylePath) {
          throw new Error('缺少 hairstylePath 参数');
        }

        // 读取发型模板图片 - 处理完整路径或相对路径
        let hairstyleFullPath;
        if (path.isAbsolute(hairstylePath)) {
          hairstyleFullPath = hairstylePath;
        } else if (hairstylePath.startsWith('images/')) {
          hairstyleFullPath = path.join(__dirname, hairstylePath);
        } else {
          hairstyleFullPath = path.join(__dirname, 'images', path.basename(hairstylePath));
        }

        console.log('   完整路径:', hairstyleFullPath);

        if (!fs.existsSync(hairstyleFullPath)) {
          const errorMsg = `发型模板文件不存在：${hairstyleFullPath}`;
          console.error('❌', errorMsg);
          throw new Error(errorMsg);
        }

        const hairstyleBuffer = fs.readFileSync(hairstyleFullPath);
        const hairstyleBase64 = hairstyleBuffer.toString('base64');

        console.log('📤 调用火山引擎 API...');
        console.log('   照片大小:', photoBase64.length, 'bytes');
        console.log('   发型大小:', hairstyleBase64.length, 'bytes');

        // 检查 photoBase64 是否有 data URI 前缀，如果没有则添加
        let photoDataUri = photoBase64;
        if (!photoBase64.startsWith('data:')) {
          photoDataUri = `data:image/png;base64,${photoBase64}`;
        }

        let hairstyleDataUri = hairstyleBase64;
        if (!hairstyleBase64.startsWith('data:')) {
          hairstyleDataUri = `data:image/png;base64,${hairstyleBase64}`;
        }

        console.log('   照片 URI 长度:', photoDataUri.length);
        console.log('   发型 URI 长度:', hairstyleDataUri.length);

        // 调用火山引擎 API
        // 图片顺序：第一张是人物照片（主图），第二张是发型模板（参考图）
        const response = await axios.post(
          `${CONFIG.VOLCENGINE_BASE_URL}/images/generations`,
          {
            model: CONFIG.VOLCENGINE_MODEL,
            prompt: prompt || '将图 2 的发型换到图 1 上，保持图 1 的脸部、五官、背景等其他元素不变',
            image: [photoDataUri, hairstyleDataUri], // 人物在前，发型在后
            size: '2K',
            sequential_image_generation: 'disabled',
            response_format: 'url',
            stream: false,
            watermark: true
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${CONFIG.VOLCENGINE_API_KEY}`
            },
            timeout: 60000
          }
        );

        const imageUrl = response.data.data[0].url;

        console.log('✅ 生成成功:', imageUrl);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          imageUrl: imageUrl
        }));

      } catch (error) {
        console.error('❌ 生成失败:', error.message);

        if (error.response) {
          console.error('   状态码:', error.response.status);
          console.error('   响应数据:', JSON.stringify(error.response.data));
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: error.message || '生成失败',
          details: error.response ? error.response.data : null
        }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/save-history') {
    // 保存历史记录到文件
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { id, hairstyleName, createdAt, originalImage, resultImage } = JSON.parse(body);

        console.log('📥 保存历史记录:', hairstyleName);

        // 创建记录文件夹
        const recordDir = path.join(__dirname, 'history', `${id}`);
        if (!fs.existsSync(recordDir)) {
          fs.mkdirSync(recordDir, { recursive: true });
        }

        // 保存元数据
        const metadata = {
          id: id,
          hairstyleName: hairstyleName,
          createdAt: createdAt
        };
        fs.writeFileSync(
          path.join(recordDir, 'metadata.json'),
          JSON.stringify(metadata, null, 2)
        );

        // 保存原图
        if (originalImage) {
          const originalBase64 = originalImage.split(',')[1];
          if (originalBase64) {
            const originalBuffer = Buffer.from(originalBase64, 'base64');
            fs.writeFileSync(path.join(recordDir, 'original.png'), originalBuffer);
          }
        }

        // 保存生成图
        if (resultImage) {
          let resultBuffer;

          // 检查是 URL 还是 Base64
          if (resultImage.startsWith('http')) {
            // 是 URL，需要下载
            console.log('   下载生成图:', resultImage);
            try {
              const imageResponse = await axios.get(resultImage, {
                responseType: 'arraybuffer',
                timeout: 30000
              });
              resultBuffer = Buffer.from(imageResponse.data);
              console.log('   ✅ 下载成功，大小:', resultBuffer.length, 'bytes');
            } catch (error) {
              console.error('   ❌ 下载失败:', error.message);
              throw new Error('无法下载生成图片');
            }
          } else {
            // 是 Base64
            const resultBase64 = resultImage.split(',')[1];
            if (resultBase64) {
              resultBuffer = Buffer.from(resultBase64, 'base64');
            }
          }

          if (resultBuffer) {
            fs.writeFileSync(path.join(recordDir, 'result.png'), resultBuffer);
            console.log('   ✅ result.png 已保存');

            // 自动生成缩略图
            try {
              await sharp(path.join(recordDir, 'result.png'))
                .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
                .jpeg({ quality: THUMBNAIL_QUALITY })
                .toFile(path.join(recordDir, 'result_thumb.jpg'));
              console.log('   ✅ result_thumb.jpg 已生成');
            } catch (thumbError) {
              console.error('   ❌ 生成缩略图失败:', thumbError.message);
            }
          }
        }

        console.log('✅ 历史记录已保存:', recordDir);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('❌ 保存历史记录失败:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/history-list') {
    // 获取历史记录列表
    try {
      const historyDir = path.join(__dirname, 'history');

      if (!fs.existsSync(historyDir)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ records: [] }));
        return;
      }

      const records = [];
      const dirs = fs.readdirSync(historyDir);

      dirs.forEach(dir => {
        const metadataPath = path.join(historyDir, dir, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

          // 检查是否有缩略图 - 优先使用缩略图
          const resultThumbPath = path.join(historyDir, dir, 'result_thumb.jpg');
          const resultPath = path.join(historyDir, dir, 'result.png');
          let imageData = null;
          if (fs.existsSync(resultThumbPath)) {
            const imageBuffer = fs.readFileSync(resultThumbPath);
            imageData = 'data:image/jpeg;base64,' + imageBuffer.toString('base64');
          } else if (fs.existsSync(resultPath)) {
            const imageBuffer = fs.readFileSync(resultPath);
            imageData = 'data:image/png;base64,' + imageBuffer.toString('base64');
          }

          records.push({
            id: metadata.id,
            hairstyleName: metadata.hairstyleName,
            createdAt: metadata.createdAt,
            imageUrl: imageData
          });
        }
      });

      // 按时间倒序排列
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('📋 获取历史记录列表:', records.length, '条');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ records: records }));
    } catch (error) {
      console.error('❌ 获取历史记录列表失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  } else if (req.method === 'GET' && req.url.startsWith('/history/') && req.url.endsWith('/result.png')) {
    // 提供历史记录图片访问（用于列表显示）
    try {
      const parts = req.url.split('/');
      const id = parts[2];
      const imagePath = path.join(__dirname, 'history', id, 'result.png');

      console.log('🖼️  收到图片请求:', req.url);
      console.log('   文件路径:', imagePath);
      console.log('   文件存在:', fs.existsSync(imagePath));

      if (!fs.existsSync(imagePath)) {
        console.error('❌ 图片文件不存在:', imagePath);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      console.log('✅ 图片发送成功:', imageBuffer.length, 'bytes');
      // 添加 CORS 头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(imageBuffer);
    } catch (error) {
      console.error('❌ 提供图片访问失败:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  } else if (req.method === 'GET' && req.url.startsWith('/history/')) {
    // 获取单条历史记录详情
    try {
      const parts = req.url.split('/');
      const id = parts[2];
      const recordDir = path.join(__dirname, 'history', id);

      if (!fs.existsSync(recordDir)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '记录不存在' }));
        return;
      }

      // 读取元数据
      const metadataPath = path.join(recordDir, 'metadata.json');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      // 读取原图
      let originalImage = null;
      const originalPath = path.join(recordDir, 'original.png');
      if (fs.existsSync(originalPath)) {
        const originalBuffer = fs.readFileSync(originalPath);
        originalImage = 'data:image/png;base64,' + originalBuffer.toString('base64');
      }

      // 读取生成图
      let imageUrl = null;
      const resultPath = path.join(recordDir, 'result.png');
      if (fs.existsSync(resultPath)) {
        const resultBuffer = fs.readFileSync(resultPath);
        imageUrl = 'data:image/png;base64,' + resultBuffer.toString('base64');
      }

      console.log('📋 获取历史记录详情:', metadata.hairstyleName);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: metadata.id,
        hairstyleName: metadata.hairstyleName,
        createdAt: metadata.createdAt,
        originalImage: originalImage,
        imageUrl: imageUrl
      }));
    } catch (error) {
      console.error('❌ 获取历史记录详情失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, HOST, () => {
  // 获取内网 IP
  const interfaces = require('os').networkInterfaces();
  let localIP = '192.168.x.x';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log(`🚀 HairSwap 本地测试服务器`);
  console.log(`📍 端口：${PORT}`);
  console.log(`🔧 API Key: ${CONFIG.VOLCENGINE_API_KEY ? '已配置 ✅' : '未配置 ❌'}`);
  console.log(`🌐 局域网访问：http://${localIP}:${PORT}`);
  console.log(`🔌 API 地址：http://${localIP}:${PORT}/generate`);
  console.log(`💾 历史记录：http://${localIP}:${PORT}/save-history`);
  console.log('');
  console.log('💡 使用说明：');
  console.log('   1. 手机连接同一 WiFi');
  console.log(`   2. 手机浏览器访问：http://${localIP}:8000`);
  console.log('   3. 上传照片、选择发型、点击生成');
  console.log('   4. 历史记录自动保存到 h5/history 目录');
  console.log('');
});
