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

// 服务器端缓存
let historyListCache = null;
let historyListCacheTime = 0;
let historyDetailCache = {}; // { id: { data: ..., time: ... } }
const CACHE_DURATION = 10 * 60 * 1000; // 10分钟缓存

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
        const { photoBase64, hairstylePath, prompt, model } = JSON.parse(body);

        console.log('📥 收到生成请求');
        console.log('   发型模板:', hairstylePath);
        console.log('   照片 Base64 长度:', photoBase64 ? photoBase64.length : 0);
        console.log('   使用模型:', model || CONFIG.VOLCENGINE_MODEL);

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
            model: model || CONFIG.VOLCENGINE_MODEL,
            prompt: prompt || '将图 1 的发型换为图 2 的发型，保持其他元素不变',
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

        const originalImageUrl = response.data.data[0].url;

        console.log('✅ 生成成功:', originalImageUrl);

        // 立即下载图片并转换为 base64，保持原始格式（JPEG）
        let imageBase64 = null;
        try {
          console.log('📥 正在下载原始图片...');
          const imageResponse = await axios.get(originalImageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
          });
          const imageBuffer = Buffer.from(imageResponse.data);

          // 保持原始格式，直接转换为 base64（不重新编码）
          imageBase64 = 'data:image/jpeg;base64,' + imageBuffer.toString('base64');
          console.log('✅ 原始图片已准备，大小:', imageBuffer.length, 'bytes');
        } catch (downloadError) {
          console.error('⚠️ 下载原始图片失败:', downloadError.message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          imageUrl: imageBase64 || originalImageUrl,
          originalImageUrl: originalImageUrl
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

        // 保存原图（保持原始格式）
        if (originalImage) {
          const originalBase64 = originalImage.split(',')[1];
          if (originalBase64) {
            const originalBuffer = Buffer.from(originalBase64, 'base64');

            // 检测图片格式并确定正确的扩展名
            let originalExt = 'png';
            try {
              const metadata = await sharp(originalBuffer).metadata();
              originalExt = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
            } catch (metadataError) {
              console.error('   ⚠️ 无法检测原图格式，默认使用 png');
            }

            const originalFilename = `original.${originalExt}`;
            fs.writeFileSync(path.join(recordDir, originalFilename), originalBuffer);
            console.log('   ✅', originalFilename, '已保存（原始格式）');
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
            // 直接保存原始图片（保持原始格式，不重新编码）
            // 根据原始图片格式自动确定扩展名
            let resultExt = 'jpg';
            try {
              // 检测图片格式
              const metadata = await sharp(resultBuffer).metadata();
              resultExt = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
            } catch (metadataError) {
              console.error('   ⚠️ 无法检测图片格式，默认使用 jpg');
            }

            const resultFilename = `result.${resultExt}`;
            fs.writeFileSync(path.join(recordDir, resultFilename), resultBuffer);
            console.log('   ✅', resultFilename, '已保存（原始格式）');

            // 自动生成缩略图
            try {
              await sharp(path.join(recordDir, resultFilename))
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

        // 清除历史记录列表缓存
        historyListCache = null;
        historyListCacheTime = 0;
        console.log('🧹 已清除历史记录列表缓存');

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
      const now = Date.now();

      // 检查缓存是否有效
      if (historyListCache && (now - historyListCacheTime) < CACHE_DURATION) {
        console.log('📋 使用缓存的历史记录列表');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ records: historyListCache }));
        return;
      }

      const historyDir = path.join(__dirname, 'history');

      if (!fs.existsSync(historyDir)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ records: [] }));
        return;
      }

      const records = [];
      const dirs = fs.readdirSync(historyDir);

      dirs.forEach(dir => {
        // 跳过以点开头的系统文件和非目录文件
        if (dir.startsWith('.')) {
          return;
        }
        const dirPath = path.join(historyDir, dir);
        if (!fs.statSync(dirPath).isDirectory()) {
          return;
        }

        const metadataPath = path.join(historyDir, dir, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

          // 构建图片URL，而不是返回base64
          let imageUrl = null;
          // 检查是否有缩略图
          const resultThumbPath = path.join(historyDir, dir, 'result_thumb.jpg');
          if (fs.existsSync(resultThumbPath)) {
            // 返回缩略图URL
            imageUrl = `/history/${dir}/result_thumb.jpg`;
          } else {
            // 查找 result 图片文件（支持 jpg、png 等格式）
            const subdir = path.join(historyDir, dir);
            const files = fs.readdirSync(subdir);
            const resultFile = files.find(f => f.startsWith('result.') && !f.endsWith('_thumb.jpg'));
            if (resultFile) {
              imageUrl = `/history/${dir}/${resultFile}`;
            }
          }

          records.push({
            id: metadata.id,
            hairstyleName: metadata.hairstyleName,
            createdAt: metadata.createdAt,
            imageUrl: imageUrl
          });
        }
      });

      // 按时间倒序排列（最新的在前）
      records.sort((a, b) => {
        try {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (!isNaN(dateB) && !isNaN(dateA)) {
            return dateB - dateA;
          }
        } catch (e) {
          console.warn('日期排序失败，使用ID排序:', e);
        }
        // 如果日期排序失败，使用 ID 排序（ID 是时间戳）
        return (b.id || 0) - (a.id || 0);
      });

      // 限制返回最多50条记录（避免数据量太大）
      const limitedRecords = records.slice(0, 50);

      console.log('📋 获取历史记录列表:', limitedRecords.length, '条（最多50条）');

      // 更新缓存
      historyListCache = limitedRecords;
      historyListCacheTime = now;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ records: limitedRecords }));
    } catch (error) {
      console.error('❌ 获取历史记录列表失败:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: error.message }));
    }
  } else if (req.method === 'GET' && req.url.startsWith('/history/') && (req.url.includes('/result.') || req.url.endsWith('/result_thumb.jpg') || req.url.includes('/original.'))) {
    // 提供历史记录图片访问（支持 result.png, result_thumb.jpg, original.png）
    try {
      const parts = req.url.split('/');
      const id = parts[2];
      const fileName = parts[3];
      const imagePath = path.join(__dirname, 'history', id, fileName);

      console.log('🖼️  收到图片请求:', req.url);
      console.log('   文件路径:', imagePath);
      console.log('   文件存在:', fs.existsSync(imagePath));

      if (!fs.existsSync(imagePath)) {
        console.error('❌ 图片文件不存在:', imagePath);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const stats = fs.statSync(imagePath);
      console.log('✅ 图片发送（流式）:', stats.size, 'bytes');

      // 根据文件扩展名设置正确的 Content-Type
      let contentType = 'image/png';
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      }

      // 添加 CORS 头和缓存头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存 24 小时
      res.setHeader('Last-Modified', stats.mtime.toUTCString());
      res.setHeader('Content-Length', stats.size);
      res.writeHead(200, { 'Content-Type': contentType });

      // 使用流式传输，避免大文件占用内存
      const readStream = fs.createReadStream(imagePath);
      readStream.pipe(res);
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
      const now = Date.now();

      // 检查缓存是否有效
      if (historyDetailCache[id] && (now - historyDetailCache[id].time) < CACHE_DURATION) {
        console.log('📋 使用缓存的历史记录详情:', id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(historyDetailCache[id].data));
        return;
      }

      const recordDir = path.join(__dirname, 'history', id);

      if (!fs.existsSync(recordDir)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '记录不存在' }));
        return;
      }

      // 读取元数据
      const metadataPath = path.join(recordDir, 'metadata.json');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

      // 返回图片URL而非base64
      let originalImage = null;
      // 查找 original 图片文件（支持 jpg、png 等格式）
      const files = fs.readdirSync(recordDir);
      const originalFile = files.find(f => f.startsWith('original.'));
      if (originalFile) {
        originalImage = `/history/${id}/${originalFile}`;
      }

      let imageUrl = null;
      // 查找 result 图片文件（支持 jpg、png 等格式）
      const resultFile = files.find(f => f.startsWith('result.') && !f.endsWith('_thumb.jpg'));
      if (resultFile) {
        imageUrl = `/history/${id}/${resultFile}`;
      }

      console.log('📋 获取历史记录详情:', metadata.hairstyleName);

      const responseData = {
        id: metadata.id,
        hairstyleName: metadata.hairstyleName,
        createdAt: metadata.createdAt,
        originalImage: originalImage,
        imageUrl: imageUrl
      };

      // 更新缓存
      historyDetailCache[id] = {
        data: responseData,
        time: now
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responseData));
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
