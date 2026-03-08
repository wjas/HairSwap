const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const CONFIG = {
  VOLCENGINE_API_KEY: process.env.VOLCANO_API_KEY || '',
  VOLCENGINE_MODEL: process.env.VOLCANO_MODEL || 'doubao-seedream-5-0-260128',
  VOLCENGINE_BASE_URL: process.env.VOLCANO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3'
}

exports.main = async (event, context) => {
  console.log('Received event:', event)
  
  try {
    const { photoBase64, hairstylePath, prompt } = event

    if (!photoBase64) {
      return {
        success: false,
        message: '缺少 photoBase64 参数'
      }
    }

    if (!hairstylePath) {
      return {
        success: false,
        message: '缺少 hairstylePath 参数'
      }
    }

    let hairstyleBuffer
    if (hairstylePath.startsWith('cloud://')) {
      const fileId = hairstylePath
      const fileResult = await cloud.downloadFile({
        fileID: fileId
      })
      hairstyleBuffer = fileResult.fileContent
    } else {
      return {
        success: false,
        message: 'hairstylePath 必须是云存储文件 ID'
      }
    }

    const hairstyleBase64 = hairstyleBuffer.toString('base64')

    let photoDataUri = photoBase64
    if (!photoBase64.startsWith('data:')) {
      photoDataUri = `data:image/png;base64,${photoBase64}`
    }

    let hairstyleDataUri = hairstyleBase64
    if (!hairstyleBase64.startsWith('data:')) {
      hairstyleDataUri = `data:image/png;base64,${hairstyleBase64}`
    }

    console.log('Calling Volcengine API...')

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
    )

    const imageUrl = response.data.data[0].url
    console.log('Generation successful:', imageUrl)

    return {
      success: true,
      imageUrl: imageUrl
    }

  } catch (error) {
    console.error('Generate error:', error)
    return {
      success: false,
      message: error.message || '生成失败',
      details: error.response ? error.response.data : null
    }
  }
}
