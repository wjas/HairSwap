class HairSwapApp {
  constructor() {
    this.state = {
      photo: null,
      photoBase64: null,
      selectedHairstyle: null,
      hairstylePath: null,
      resultImage: null,
      history: [], // 生成历史记录
      serverIP: '192.168.2.60' // 局域网服务器 IP（可配置）
    };

    this.config = {
      maxFileSize: 10 * 1024 * 1024,
      apiBaseUrl: '', // 留空表示使用本地测试模式
      useMockMode: true, // 本地测试模式：使用测试脚本直接调用 API
      hairstyleMap: {
        'style1': 'hairstyle1.png',
        'style2': 'hairstyle2.png',
        'style3': 'hairstyle3.png',
        'style4': 'hairstyle4.png'
      }
    };

    // 标记是否在详情页
    this.isInDetailPage = false;

    this.init();
    this.loadHistory(); // 加载历史记录
    this.loadPhotoFromStorage(); // 加载本地存储的照片
  }

  init() {
    this.bindEvents();
    this.loadHairstyleTemplates();
  }

  bindEvents() {
    const photoPreview = document.getElementById('photo-preview');
    const photoInput = document.getElementById('photo-input');
    const photoRemove = document.getElementById('photo-remove');
    const generateBtn = document.getElementById('generate-btn');
    const backBtn = document.getElementById('back-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const saveBtn = document.getElementById('save-btn');
    const historyBtn = document.getElementById('history-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');

    photoPreview.addEventListener('click', () => {
      if (!this.state.photo) {
        photoInput.click();
      }
    });

    // 手机端按钮事件
    if (cameraBtn && galleryBtn) {
      cameraBtn.addEventListener('click', () => {
        console.log('📸 点击拍照按钮');
        cameraInput.click();
      });
      
      galleryBtn.addEventListener('click', () => {
        console.log('🖼️ 点击相册按钮');
        galleryInput.click();
      });
    }

    photoInput.addEventListener('change', (e) => {
      console.log('📁 photo-input 文件选择');
      this.handlePhotoUpload(e.target.files[0]);
    });

    cameraInput.addEventListener('change', (e) => {
      console.log('📸 camera-input 文件选择');
      this.handlePhotoUpload(e.target.files[0]);
    });

    galleryInput.addEventListener('change', (e) => {
      console.log('🖼️ gallery-input 文件选择');
      this.handlePhotoUpload(e.target.files[0]);
    });

    photoRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removePhoto();
    });

    generateBtn.addEventListener('click', () => {
      this.generateHairstyle();
    });

    backBtn.addEventListener('click', () => {
      console.log('🔙 返回按钮点击，isInDetailPage:', this.isInDetailPage);
      if (this.isInDetailPage) {
        console.log('📋 从详情页返回列表页');
        this.showHistory();
      } else {
        console.log('🏠 从其他页面返回主页');
        this.showPage('home-page');
      }
    });

    regenerateBtn.addEventListener('click', () => {
      this.showPage('home-page');
    });

    saveBtn.addEventListener('click', () => {
      this.saveResult();
    });

    historyBtn.addEventListener('click', () => {
      this.showHistory();
    });

    const hairstyleItems = document.querySelectorAll('.hairstyle-item[data-style]');
    hairstyleItems.forEach(item => {
      item.addEventListener('click', () => {
        this.selectHairstyle(item);
      });
    });
  }

  handlePhotoUpload(file) {
    if (!file) return;

    if (!file.type.match('image/(png|jpeg)')) {
      this.showToast('请上传 PNG 或 JPG 格式的图片');
      return;
    }

    if (file.size > this.config.maxFileSize) {
      this.showToast('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.state.photo = file;
      this.state.photoBase64 = e.target.result;
      this.updatePhotoPreview();
      this.checkGenerateButton();
    };
    reader.onerror = () => {
      this.showToast('图片读取失败，请重试');
    };
    reader.readAsDataURL(file);
  }

  updatePhotoPreview() {
    const previewArea = document.getElementById('photo-preview');
    const previewImage = document.getElementById('photo-image');

    if (this.state.photo) {
      previewArea.classList.add('has-image');
      previewImage.src = this.state.photoBase64;
    } else {
      previewArea.classList.remove('has-image');
      previewImage.src = '';
    }
  }

  removePhoto() {
    this.state.photo = null;
    this.state.photoBase64 = null;
    this.updatePhotoPreview();
    this.checkGenerateButton();

    // 清除本地存储
    this.clearPhotoFromStorage();
  }

  selectHairstyle(item) {
    const styleId = item.dataset.style;

    if (!this.config.hairstyleMap[styleId]) {
      this.showToast('该发型即将上线，敬请期待');
      return;
    }

    document.querySelectorAll('.hairstyle-item').forEach(el => {
      el.classList.remove('selected');
    });

    item.classList.add('selected');
    this.state.selectedHairstyle = styleId;
    this.state.hairstylePath = this.config.hairstyleMap[styleId];
    this.checkGenerateButton();
  }

  checkGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const canGenerate = this.state.photo && this.state.selectedHairstyle;
    generateBtn.disabled = !canGenerate;
  }

  async loadHairstyleTemplates() {
    const hairstyleItems = document.querySelectorAll('.hairstyle-item[data-style]');
    hairstyleItems.forEach(item => {
      const styleId = item.dataset.style;
      const img = item.querySelector('img');
      if (img && img.src) {
        img.onerror = () => {
          item.querySelector('.hairstyle-thumb').innerHTML = '<div class="coming-soon">加载失败</div>';
        };
      }
    });
  }

  async generateHairstyle() {
    if (!this.state.photo || !this.state.selectedHairstyle) {
      this.showToast('请先上传照片并选择发型');
      return;
    }

    this.showPage('loading-page');

    try {
      // 本地测试模式：调用本地测试脚本
      if (this.config.useMockMode) {
        await this.generateWithMockMode();
        return;
      }

      // 云函数模式
      const response = await fetch(`${this.config.apiBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoBase64: this.state.photoBase64,
          hairstylePath: this.state.hairstylePath,
          prompt: '将图 1 的发型换为图 2 的发型，保持其他元素不变'
        })
      });

      if (!response.ok) {
        throw new Error('生成失败，请稍后重试');
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        this.state.resultImage = data.imageUrl;
        this.showResult();
      } else {
        throw new Error(data.message || '生成失败');
      }
    } catch (error) {
      console.error('生成失败:', error);
      this.showToast(error.message || '生成失败，请稍后重试');
      // 失败时返回首页
      setTimeout(() => {
        this.showPage('home-page');
      }, 1500);
    }
  }

  async generateWithMockMode() {
    // 本地测试模式：调用本地 Node.js 测试脚本
    // 使用服务器 IP 而不是 localhost（支持局域网访问）
    const hairstyleFullPath = `images/${this.state.hairstylePath}`;
    const serverUrl = `http://${this.state.serverIP}:3001/generate`;

    console.log('📡 请求服务器:', serverUrl);

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photoBase64: this.state.photoBase64,
          hairstylePath: hairstyleFullPath,
          prompt: '将图 1 的发型换为图 2 的发型，保持其他元素不变'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '生成失败');
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        this.state.resultImage = data.imageUrl;

        // 保存到文件系统（通过服务器 API）
        const hairstyleName = `发型${this.state.selectedHairstyle.replace('style', '')}`;
        this.saveHistoryToServer(hairstyleName);

        this.showResult();
      } else {
        throw new Error(data.message || '生成失败');
      }
    } catch (error) {
      console.error('生成失败:', error);
      this.showToast(error.message || '生成失败，请稍后重试');
      // 失败时返回首页
      setTimeout(() => {
        this.showPage('home-page');
      }, 1500);
    }
  }

  // 保存历史记录到服务器文件系统
  async saveHistoryToServer(hairstyleName) {
    const id = Date.now();
    const createdAt = new Date().toISOString();

    // 获取服务器地址
    const serverUrl = this.getBackendUrl() + '/save-history';

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          hairstyleName: hairstyleName,
          createdAt: createdAt,
          originalImage: this.state.photoBase64,
          resultImage: this.state.resultImage
        })
      });

      if (response.ok) {
        console.log('✅ 历史记录已保存到服务器:', hairstyleName);
      } else {
        console.error('❌ 保存失败:', response.statusText);
      }
    } catch (error) {
      console.error('❌ 保存历史记录失败:', error);
    }
  }

  showResult() {
    const resultImage = document.getElementById('result-image');
    resultImage.src = this.state.resultImage;

    // 重置详情页标记
    this.isInDetailPage = false;
    
    // 重置返回按钮行为为返回主页
    const resultBackBtn = document.getElementById('back-btn');
    const resultHeader = document.getElementById('result-header');
    if (resultBackBtn) {
      resultBackBtn.onclick = () => {
        this.showPage('home-page');
      };
    }
    if (resultHeader) {
      resultHeader.onclick = null;
    }

    // 添加到历史记录
    const hairstyleName = `发型${this.state.selectedHairstyle.replace('style', '')}`;
    this.addToHistory(this.state.resultImage, hairstyleName);

    // 添加对比按钮事件
    this.setupCompareButton();

    this.showPage('result-page');
  }

  // 设置对比按钮
  setupCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    const resultImage = document.getElementById('result-image');

    if (!compareBtn || !this.state.photoBase64) {
      if (compareBtn) compareBtn.style.display = 'none';
      return;
    }

    compareBtn.style.display = 'flex';

    let isShowingOriginal = false;
    let pressTimer;

    const showOriginal = () => {
      if (this.state.photoBase64) {
        resultImage.src = this.state.photoBase64;
        isShowingOriginal = true;
      }
    };

    const showResult = () => {
      if (this.state.resultImage) {
        resultImage.src = this.state.resultImage;
        isShowingOriginal = false;
      }
    };

    // 鼠标按下/触摸开始
    const startPress = (e) => {
      e.preventDefault();
      pressTimer = setTimeout(() => {
        showOriginal();
      }, 100);
    };

    // 鼠标松开/触摸结束
    const endPress = (e) => {
      e.preventDefault();
      clearTimeout(pressTimer);
      setTimeout(() => {
        showResult();
      }, 50);
    };

    // 鼠标事件
    compareBtn.addEventListener('mousedown', startPress);
    compareBtn.addEventListener('mouseup', endPress);
    compareBtn.addEventListener('mouseleave', endPress);

    // 触摸事件
    compareBtn.addEventListener('touchstart', startPress);
    compareBtn.addEventListener('touchend', endPress);
    compareBtn.addEventListener('touchcancel', endPress);
  }

  saveResult() {
    const imageUrl = this.state.resultImage;
    if (!imageUrl) {
      this.showToast('没有可保存的图片');
      return;
    }

    // 由于 CORS 限制，使用新窗口打开图片，让用户长按保存
    window.open(imageUrl, '_blank');
    this.showToast('已在新窗口打开图片，请长按保存');
  }

  // 配置后端服务器地址
  getBackendUrl() {
    // 使用固定的后端服务器地址
    const hostname = window.location.hostname;
    // 如果是 file:// 协议或者 hostname 为空，使用固定的 192.168.2.60
    if (!hostname || hostname === '' || window.location.protocol === 'file:') {
      return 'http://192.168.2.60:3001';
    }
    // 如果是 localhost，使用 192.168.2.60
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://192.168.2.60:3001';
    }
    // 其他情况使用当前 hostname
    return 'http://' + hostname + ':3001';
  }

  // 加载历史记录
  async loadHistory() {
    // 优先尝试从服务器加载
    try {
      const serverUrl = this.getBackendUrl() + '/history-list';
      console.log('🔍 尝试从服务器加载历史记录:', serverUrl);
      const response = await fetch(serverUrl);
      if (response.ok) {
        const data = await response.json();
        this.state.history = (data.records || []).map(record => {
          console.log('🖼️  历史记录（服务器）:', record.id, record.hairstyleName, record.imageUrl ? '有图片' : '无图片');
          return {
            ...record,
            imageUrl: record.imageUrl
          };
        });
        console.log('✅ 从服务器加载历史记录:', this.state.history.length, '条');
        
        // 同时保存到 localStorage 作为备份
        this.saveHistoryToLocalStorage();
        return;
      }
    } catch (error) {
      console.log('⚠️ 服务器加载失败，尝试从 localStorage 加载:', error.message);
    }
    
    // 服务器加载失败，从 localStorage 加载
    try {
      const saved = localStorage.getItem('hairSwapHistory');
      if (saved) {
        this.state.history = JSON.parse(saved);
        console.log('✅ 从 localStorage 加载历史记录:', this.state.history.length, '条');
      } else {
        console.log('ℹ️ localStorage 中没有历史记录');
        this.state.history = [];
      }
    } catch (error) {
      console.error('❌ 从 localStorage 加载失败:', error);
      this.state.history = [];
    }
  }

  // 保存历史记录到 localStorage
  saveHistoryToLocalStorage() {
    try {
      localStorage.setItem('hairSwapHistory', JSON.stringify(this.state.history));
      console.log('💾 历史记录已保存到 localStorage');
    } catch (error) {
      console.error('❌ 保存到 localStorage 失败:', error);
    }
  }

  // 保存历史记录到文件系统
  saveHistory() {
    // 历史记录由服务器自动保存到文件系统
    // 同时也保存到 localStorage
    this.saveHistoryToLocalStorage();
    console.log('💾 历史记录已保存');
  }

  // 添加到历史记录
  addToHistory(imageUrl, hairstyleName) {
    const record = {
      id: Date.now(),
      originalImage: this.state.photoBase64, // 保存原图
      imageUrl: imageUrl, // 生成图
      hairstyleName: hairstyleName,
      createdAt: new Date().toISOString()
    };

    // 添加到开头
    this.state.history.unshift(record);

    // 只保留最近 20 条
    if (this.state.history.length > 20) {
      this.state.history = this.state.history.slice(0, 20);
    }

    this.saveHistory();

    // 保存到文件
    this.saveHistoryToFile(record);
  }

  // 保存历史记录到文件
  async saveHistoryToFile(record) {
    try {
      // 提取 Base64 数据部分
      const originalBase64 = record.originalImage.split(',')[1];
      const resultBase64 = record.imageUrl.split(',')[1];

      if (!originalBase64 || !resultBase64) {
        console.error('Base64 数据格式错误');
        return;
      }

      // 调用本地服务器保存文件
      const response = await fetch(`http://${this.state.serverIP}:3001/save-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: record.id,
          hairstyleName: record.hairstyleName,
          createdAt: record.createdAt,
          originalImage: originalBase64,
          resultImage: resultBase64
        })
      });

      if (response.ok) {
        console.log('✅ 历史记录已保存到文件');
      } else {
        console.error('保存历史记录失败');
      }
    } catch (error) {
      console.error('保存历史记录出错:', error);
    }
  }

  // 保存当前照片到本地存储（已废弃，直接使用服务器存储）
  savePhotoToStorage() {
    // 不再使用 localStorage
  }

  // 从本地存储加载照片
  loadPhotoFromStorage() {
    const saved = localStorage.getItem('currentPhoto');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // 检查是否过期（7 天）
        const savedTime = new Date(data.savedAt).getTime();
        const now = Date.now();
        const daysDiff = (now - savedTime) / (1000 * 60 * 60 * 24);

        if (daysDiff < 7) {
          this.state.photoBase64 = data.base64;
          // 更新 UI 显示
          setTimeout(() => {
            const photoPreview = document.getElementById('photo-preview');
            const uploadPlaceholder = photoPreview.querySelector('.upload-placeholder');
            if (uploadPlaceholder) {
              uploadPlaceholder.style.display = 'none';
              const img = document.createElement('img');
              img.src = data.base64;
              img.className = 'preview-image';
              photoPreview.appendChild(img);

              // 显示删除按钮
              const photoRemove = document.getElementById('photo-remove');
              if (photoRemove) {
                photoRemove.style.display = 'flex';
              }
            }
          }, 100);
        } else {
          // 过期删除
          localStorage.removeItem('currentPhoto');
        }
      } catch (error) {
        console.error('加载照片失败:', error);
      }
    }
  }

  // 清除本地存储的照片
  clearPhotoFromStorage() {
    localStorage.removeItem('currentPhoto');
  }

  // 显示历史记录页面
  async showHistory() {
    console.log('📋 showHistory 开始执行');
    
    // 重置详情页标记
    this.isInDetailPage = false;
    console.log('🏷️ 重置 isInDetailPage 标记为 false');
    
    // 先加载历史记录
    await this.loadHistory();
    console.log('📋 历史记录加载完成');

    const historyHtml = this.state.history.map((record, index) => {
      const date = new Date(record.createdAt).toLocaleString('zh-CN');
      console.log(`📝 历史记录 ${index + 1}:`, {
        id: record.id,
        name: record.hairstyleName,
        imageUrl: record.imageUrl
      });
      return `
        <div class="history-item" data-id="${record.id}">
          <img src="${record.imageUrl}" alt="${record.hairstyleName}" 
               onload="console.log('✅ 图片加载成功:', this.src)" 
               onerror="console.error('❌ 图片加载失败:', this.src, '错误:', event); this.alt='加载失败';">
          <div class="history-item-info">
            <div class="history-item-name">${record.hairstyleName}</div>
            <div class="history-item-date">${date}</div>
          </div>
        </div>
      `;
    }).join('');

    const historyPage = `
      <div id="history-page" class="page active">
        <div class="container">
          <header class="result-header" id="history-header">
            <button id="history-back-btn" class="back-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2>生成记录</h2>
          </header>
          <main class="result-content">
            ${this.state.history.length === 0 ?
        '<div class="empty-history">暂无生成记录</div>' :
        `<div class="history-grid">${historyHtml}</div>`
      }
          </main>
        </div>
      </div>
    `;

    // 移除旧的 history page（如果有）
    const oldHistoryPage = document.getElementById('history-page');
    if (oldHistoryPage) {
      oldHistoryPage.remove();
    }

    // 添加到 DOM
    document.getElementById('app').insertAdjacentHTML('beforeend', historyPage);

    // 绑定返回按钮事件 - 整个 header 都可点击
    const historyHeader = document.getElementById('history-header');
    const backBtn = document.getElementById('history-back-btn');
    
    // header 整体点击事件
    historyHeader.addEventListener('click', (e) => {
      // 如果点击的是 button 本身，不重复触发
      if (e.target !== backBtn && !backBtn.contains(e.target)) {
        console.log('🔙 点击 header 区域，返回主页');
        this.showPage('home-page');
      }
    });
    
    // back-btn 点击事件 - 列表页直接返回主页
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止冒泡
      console.log('🔙 点击列表页返回按钮，返回主页');
      this.showPage('home-page');
    }, { once: false });

    // 绑定历史记录项点击事件
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        this.viewHistoryItem(id);
      });
    });

    this.showPage('history-page');
  }

  // 查看历史记录项（从服务器加载）
  async viewHistoryItem(id) {
    // 从服务器获取记录详情
    try {
      const serverUrl = this.getBackendUrl() + '/history/' + id;
      const response = await fetch(serverUrl);
      if (response.ok) {
        const record = await response.json();
        this.state.resultImage = record.imageUrl;
        this.state.photoBase64 = record.originalImage;

        // 显示结果页面
        const resultImage = document.getElementById('result-image');
        resultImage.src = this.state.resultImage;

        // 显示对比按钮和保存按钮
        const compareBtn = document.getElementById('compare-btn');
        const saveBtn = document.getElementById('save-btn');
        if (compareBtn) compareBtn.style.display = 'flex';
        if (saveBtn) saveBtn.style.display = 'block';

        // 设置对比按钮事件
        this.setupCompareButton();

        // 更新标题
        const headerTitle = document.querySelector('#result-page h2');
        if (headerTitle) {
          headerTitle.textContent = record.hairstyleName || '历史记录';
        }

        // 设置标记，让主事件处理器知道当前在详情页
        this.isInDetailPage = true;

        // 绑定详情页 header 点击事件
        const resultHeader = document.getElementById('result-header');
        const resultBackBtn = document.getElementById('back-btn');
        
        // 直接使用 onclick 来控制，避免事件冲突
        resultBackBtn.onclick = (e) => {
          e.stopPropagation(); // 阻止冒泡到 header
          console.log('🔙 点击详情页返回按钮，返回列表页');
          this.showHistory();
        };
        
        // header 整体点击事件（排除 back-btn）
        resultHeader.onclick = (e) => {
          if (e.target !== resultBackBtn && !resultBackBtn.contains(e.target)) {
            console.log('🔙 点击详情页 header 区域，返回列表页');
            this.showHistory();
          }
        };

        this.showPage('result-page');
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.showToast('加载失败');
    }
  }

  showPage(pageId) {
    console.log('🔄 showPage 被调用:', pageId, new Date().toISOString());
    
    // 如果切换到主页或发型选择页，重置详情页标记
    if (pageId === 'home-page' || pageId === 'hairstyle-page') {
      console.log('🏷️ 重置 isInDetailPage 标记');
      this.isInDetailPage = false;
      
      console.log('⚠️ 切换到主页，移除历史记录页面');
      const historyPage = document.getElementById('history-page');
      if (historyPage) {
        historyPage.remove();
      }
    }

    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    console.log('✅ showPage 完成:', pageId);
  }

  showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.hairSwapApp = new HairSwapApp();
});
