/**
 * HairSwap 腾讯云云函数
 * 
 * 用途：腾讯云 Serverless 部署
 * 平台：腾讯云函数 SCF（Web 函数）
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 80;

const CONFIG = {
  VOLCENGINE_API_KEY: process.env.VOLCANO_API_KEY || '',
  VOLCENGINE_MODEL: process.env.VOLCANO_MODEL || 'doubao-seedream-5-0-260128',
  VOLCENGINE_BASE_URL: process.env.VOLCANO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3'
};

console.log('🚀 HairSwap 腾讯云云函数启动');
console.log('🔧 API Key:', CONFIG.VOLCENGINE_API_KEY ? '已配置' : '⚠️ 未配置');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const reqPath = req.url;
    const method = req.method;
    
    console.log('Request:', method, reqPath);

    if (reqPath === '/generate' && method === 'POST') {
      await handleGenerate(req, res);
      return;
    }

    if (reqPath === '/save-history' && method === 'POST') {
      await handleSaveHistory(req, res);
      return;
    }

    if (reqPath === '/history-list' && method === 'GET') {
      await handleHistoryList(req, res);
      return;
    }

    if (reqPath && reqPath.startsWith('/history/')) {
      await handleHistoryDetail(req, res);
      return;
    }

    await serveStatic(req, res);
    
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function handleGenerate(req, res) {
  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { photoBase64, hairstylePath, prompt } = JSON.parse(body);

        console.log('📥 收到生成请求');
        console.log('   发型模板:', hairstylePath);

        if (!photoBase64) {
          throw new Error('缺少 photoBase64 参数');
        }

        if (!hairstylePath) {
          throw new Error('缺少 hairstylePath 参数');
        }

        let hairstyleFullPath;
        if (path.isAbsolute(hairstylePath)) {
          hairstyleFullPath = hairstylePath;
        } else if (hairstylePath.startsWith('images/')) {
          hairstyleFullPath = path.join(__dirname, 'h5', hairstylePath);
        } else {
          hairstyleFullPath = path.join(__dirname, 'h5', 'images', path.basename(hairstylePath));
        }

        if (!fs.existsSync(hairstyleFullPath)) {
          throw new Error(`发型模板文件不存在：${hairstyleFullPath}`);
        }

        const hairstyleBuffer = fs.readFileSync(hairstyleFullPath);
        const hairstyleBase64 = hairstyleBuffer.toString('base64');

        let photoDataUri = photoBase64;
        if (!photoBase64.startsWith('data:')) {
          photoDataUri = `data:image/png;base64,${photoBase64}`;
        }

        let hairstyleDataUri = hairstyleBase64;
        if (!hairstyleBase64.startsWith('data:')) {
          hairstyleDataUri = `data:image/png;base64,${hairstyleBase64}`;
        }

        console.log('📤 调用火山引擎 API...');

        const response = await axios.post(
          `${CONFIG.VOLCENGINE_BASE_URL}/images/generations`,
          {
            model: CONFIG.VOLCENGINE_MODEL,
            prompt: prompt || '将图 2 的发型换到图 1 上，保持图 1 的脸部、五官、背景等其他元素不变',
            image: [photoDataUri, hairstyleDataUri],
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
  } catch (error) {
    console.error('Generate error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function handleSaveHistory(req, res) {
  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { id, hairstyleName, createdAt, originalImage, resultImage } = JSON.parse(body);
        console.log('📥 保存历史记录:', hairstyleName);

        const recordDir = path.join(__dirname, 'h5', 'history', `${id}`);
        if (!fs.existsSync(recordDir)) {
          fs.mkdirSync(recordDir, { recursive: true });
        }

        const metadata = {
          id: id,
          hairstyleName: hairstyleName,
          createdAt: createdAt
        };
        fs.writeFileSync(
          path.join(recordDir, 'metadata.json'),
          JSON.stringify(metadata, null, 2)
        );

        if (originalImage) {
          const originalBase64 = originalImage.split(',')[1];
          if (originalBase64) {
            const originalBuffer = Buffer.from(originalBase64, 'base64');
            fs.writeFileSync(path.join(recordDir, 'original.png'), originalBuffer);
          }
        }

        if (resultImage) {
          let resultBuffer;

          if (resultImage.startsWith('http')) {
            console.log('   下载生成图:', resultImage);
            try {
              const imageResponse = await axios.get(resultImage, {
                responseType: 'arraybuffer',
                timeout: 30000
              });
              resultBuffer = Buffer.from(imageResponse.data);
            } catch (error) {
              console.error('   ❌ 下载失败:', error.message);
              throw new Error('无法下载生成图片');
            }
          } else {
            const resultBase64 = resultImage.split(',')[1];
            if (resultBase64) {
              resultBuffer = Buffer.from(resultBase64, 'base64');
            }
          }

          if (resultBuffer) {
            fs.writeFileSync(path.join(recordDir, 'result.png'), resultBuffer);
            console.log('   ✅ result.png 已保存');

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
  } catch (error) {
    console.error('Save history error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

async function handleHistoryList(req, res) {
  try {
    const historyDir = path.join(__dirname, 'h5', 'history');

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

    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log('📋 获取历史记录列表:', records.length, '条');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ records: records }));
  } catch (error) {
    console.error('❌ 获取历史记录列表失败:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: error.message }));
  }
}

async function handleHistoryDetail(req, res) {
  try {
    const reqPath = req.url;
    
    if (reqPath.endsWith('/result.png')) {
      const parts = reqPath.split('/');
      const id = parts[2];
      const imagePath = path.join(__dirname, 'h5', 'history', id, 'result.png');

      console.log('🖼️  收到图片请求:', reqPath);

      if (!fs.existsSync(imagePath)) {
        console.error('❌ 图片文件不存在:', imagePath);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(imageBuffer);
      return;
    }

    const parts = reqPath.split('/');
    const id = parts[2];
    const recordDir = path.join(__dirname, 'h5', 'history', id);

    if (!fs.existsSync(recordDir)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: '记录不存在' }));
      return;
    }

    const metadataPath = path.join(recordDir, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    let originalImage = null;
    const originalPath = path.join(recordDir, 'original.png');
    if (fs.existsSync(originalPath)) {
      const originalBuffer = fs.readFileSync(originalPath);
      originalImage = 'data:image/png;base64,' + originalBuffer.toString('base64');
    }

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
}

async function serveStatic(req, res) {
  let filePath = req.url;
  
  if (filePath === '/' || filePath === '' || !filePath) {
    filePath = '/index.html';
  }
  
  filePath = filePath.replace(/\.\./g, '');
  
  const fullPath = path.join(__dirname, 'h5', filePath);
  
  console.log('Serving file:', fullPath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.json': 'application/json; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8'
    };
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const isBinary = ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.ico';
    
    res.writeHead(200, { 'Content-Type': mimeType });
    
    if (isBinary) {
      const content = fs.readFileSync(fullPath);
      res.end(content);
    } else {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.end(content);
    }
  } catch (error) {
    console.error('Serve static error:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>500 Internal Server Error</h1>');
  }
}
