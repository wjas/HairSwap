// ============================================================================
// 调试工具（用于移动端调试）
// 使用说明：详见 /DEBUG_TOOL.md
// ============================================================================
// 版本号：每次更新代码前请 +1，用于验证缓存刷新
const APP_VERSION = 16;

// 调试面板功能（已注释）
// function initDebugPanel() {
//   const debugBtn = document.getElementById('debug-btn');
//   const debugPanel = document.getElementById('debug-panel');
// 
//   if (!debugBtn || !debugPanel) return;
// 
//   let isVisible = false;
//   const logs = [];
// 
//   // 重写 console.log
//   const originalLog = console.log;
//   console.log = function (...args) {
//     logs.push(args.join(' '));
//     if (logs.length > 50) logs.shift(); // 只保留最近 50 条
//     if (isVisible) {
//       debugPanel.innerHTML = logs.join('<br>');
//       debugPanel.scrollTop = debugPanel.scrollHeight;
//     }
//     originalLog.apply(console, args);
//   };
// 
//   // 点击按钮切换显示
//   debugBtn.onclick = () => {
//     isVisible = !isVisible;
//     debugPanel.style.display = isVisible ? 'block' : 'none';
//     if (isVisible) {
//       debugPanel.innerHTML = logs.join('<br>');
//       debugPanel.scrollTop = debugPanel.scrollHeight;
//     }
//   };
// 
//   console.log('🔧 调试面板已初始化');
// }
// 
// // 页面加载时初始化调试面板
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initDebugPanel);
// } else {
//   initDebugPanel();
// }
// ============================================================================

class HairSwapApp {
  constructor() {
    this.state = {
      photo: null,
      photoBase64: null,
      selectedHairstyle: null,
      hairstylePath: null,
      resultImage: null,
      originalImageUrl: null, // 保存火山引擎原始图片 URL
      history: [], // 生成历史记录
      currentModel: 'ep-20260309025356-rp498', // 默认模型：4.5
      historyLoaded: false, // 标记历史记录是否已加载
      historyCacheTime: 0, // 历史记录缓存时间
      historyDetailCache: {}, // { id: { data: ..., time: ... } } - 详情页缓存
      historyDetailCacheTime: 5 * 60 * 1000 // 详情页缓存5分钟
    };

    this.config = {
      maxFileSize: 10 * 1024 * 1024,
      apiBaseUrl: '', // 留空表示使用本地测试模式
      apiServerUrl: 'http://106.52.29.87:3001', // API 服务器地址（用于密码验证等）
      useMockMode: true, // 本地测试模式：使用测试脚本直接调用 API
      hairstyleMap: {
        'style1': 'hairstyle1.png',
        'style2': 'hairstyle2.png',
        'style3': 'hairstyle3.png',
        'style4': 'hairstyle4.png',
        'style5': 'hairstyle5.png',
        'style6': 'hairstyle6.png',
        'style7': 'hairstyle7.png',
        'style8': 'hairstyle8.png'
      }
    };

    // 标记是否在详情页
    this.isInDetailPage = false;

    this.init();
    // this.loadHistory(); // 加载历史记录 - 等用户点击"生成记录"按钮时再加载
    this.loadPhotoFromStorage(); // 加载本地存储的照片
    // this.showVersion(); // 显示版本号（调试时使用，平时注释掉）
  }

  // 显示版本号（用于验证缓存刷新）
  showVersion() {
    console.log('📦 HairSwap App 版本:', APP_VERSION);
    // 在页面底部显示版本号（样式与 DEBUG 按钮一致）
    setTimeout(() => {
      const versionBtn = document.createElement('button');
      versionBtn.style.cssText = 'position:fixed;bottom:5px;right:10px;font-size:10px;padding:2px 6px;background:#007bff;color:#fff;border:none;border-radius:4px;z-index:9999;cursor:pointer;';
      versionBtn.textContent = 'v' + APP_VERSION;
      versionBtn.title = 'HairSwap 版本号';
      document.body.appendChild(versionBtn);
    }, 1000);
  }

  init() {
    this.bindEvents();
    this.loadHairstyleTemplates();
    this.initPasswordVerification(); // 初始化密码验证
  }

  // 初始化密码验证
  initPasswordVerification() {
    const modal = document.getElementById('password-modal');
    const digitInputs = [
      document.getElementById('password-input-1'),
      document.getElementById('password-input-2'),
      document.getElementById('password-input-3'),
      document.getElementById('password-input-4')
    ];
    const hiddenInput = document.getElementById('password-input-hidden');
    const submitBtn = document.getElementById('password-submit-btn');
    const errorDiv = document.getElementById('password-error');

    if (!modal || !digitInputs[0] || !submitBtn) {
      console.log('⚠️ 密码验证组件未找到，跳过密码验证');
      return;
    }

    let attemptCount = 0;
    const maxAttempts = 3;

    // 检查密码状态
    this.checkPasswordStatus().then(status => {
      if (!status.enabled) {
        console.log('🔓 密码验证未启用');
        return;
      }

      // 显示密码弹窗
      modal.style.display = 'block';
    }).catch(error => {
      console.error('❌ 检查密码状态失败:', error);
    });

    // 点击弹窗内容时聚焦到第一个输入框
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.addEventListener('click', (e) => {
        // 如果点击的不是按钮，聚焦到第一个输入框
        if (e.target.tagName !== 'BUTTON') {
          digitInputs[0].focus();
        }
      });
    }

    // 处理数字输入框的输入
    digitInputs.forEach((input, index) => {
      // 输入事件
      input.addEventListener('input', (e) => {
        const value = e.target.value;

        // 只允许数字
        if (!/^\d*$/.test(value)) {
          e.target.value = '';
          return;
        }

        // 更新隐藏输入框
        hiddenInput.value = digitInputs.map(inp => inp.value).join('');

        // 标记为已填充
        if (value) {
          e.target.classList.add('filled');
          // 自动跳转到下一个输入框
          if (index < 3 && digitInputs[index + 1]) {
            digitInputs[index + 1].focus();
          }
        } else {
          e.target.classList.remove('filled');
        }
      });

      // 按键事件
      input.addEventListener('keydown', (e) => {
        // 删除键，如果当前为空，跳转到前一个
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          e.preventDefault();
          digitInputs[index - 1].value = '';
          digitInputs[index - 1].classList.remove('filled');
          digitInputs[index - 1].focus();
          hiddenInput.value = digitInputs.map(inp => inp.value).join('');
        }
      });

      // 聚焦时选中内容
      input.addEventListener('focus', (e) => {
        e.target.select();
      });
    });

    // 提交密码
    submitBtn.addEventListener('click', () => {
      const password = digitInputs.map(inp => inp.value).join('');

      if (!password || password.length !== 4 || !/^\d{4}$/.test(password)) {
        this.showPasswordError('请输入 4 位数字密码');
        return;
      }

      attemptCount++;

      this.verifyPassword(password).then(valid => {
        if (valid) {
          console.log('✅ 密码验证通过');
          this.closePasswordModal();
        } else {
          console.log('❌ 密码验证失败');
          if (attemptCount >= maxAttempts) {
            this.showPasswordError(`密码错误，已达到最大尝试次数（${maxAttempts}次），请刷新页面重试`);
            submitBtn.disabled = true;
          } else {
            this.showPasswordError(`密码错误，还剩${maxAttempts - attemptCount}次尝试机会`);
            // 清空所有输入框
            digitInputs.forEach(input => {
              input.value = '';
              input.classList.remove('filled');
              input.classList.add('error');
            });
            hiddenInput.value = '';
            // 移除错误样式
            setTimeout(() => {
              digitInputs.forEach(input => input.classList.remove('error'));
            }, 300);
            // 聚焦到第一个输入框
            digitInputs[0].focus();
          }
        }
      }).catch(error => {
        console.error('❌ 验证密码失败:', error);
        this.showPasswordError('验证失败，请稍后重试');
      });
    });

    // 任意输入框回车提交
    digitInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      });
    });
  }

  // 检查密码状态
  async checkPasswordStatus() {
    try {
      const response = await fetch(`${this.config.apiServerUrl}/api/password/status`);
      const status = await response.json();
      return status;
    } catch (error) {
      console.error('❌ 检查密码状态失败:', error);
      return { enabled: false };
    }
  }

  // 验证密码
  async verifyPassword(password) {
    try {
      const response = await fetch(`${this.config.apiServerUrl}/api/password/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('❌ 验证密码失败:', error);
      return false;
    }
  }

  // 关闭密码弹窗
  closePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // 显示密码错误
  showPasswordError(message) {
    const errorDiv = document.getElementById('password-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
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
    const modelBtn = document.getElementById('model-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const resultHeader = document.getElementById('result-header');

    photoPreview.addEventListener('click', () => {
      if (!this.state.photo) {
        photoInput.click();
      }
    });

    // 手机端按钮事件
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => {
        console.log('📸 点击上传照片按钮');
        photoInput.click();
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

    // 让"换发型效果"标题也能点击返回
    if (resultHeader) {
      const resultTitle = resultHeader.querySelector('h2');
      if (resultTitle) {
        resultTitle.addEventListener('click', () => {
          console.log('🔙 点击标题返回，isInDetailPage:', this.isInDetailPage);
          if (this.isInDetailPage) {
            console.log('📋 从详情页返回列表页');
            this.showHistory();
          } else {
            console.log('🏠 从其他页面返回主页');
            this.showPage('home-page');
          }
        });
      }
    }

    regenerateBtn.addEventListener('click', () => {
      this.showPage('home-page');
    });

    saveBtn.addEventListener('click', () => {
      this.saveResult();
    });

    historyBtn.addEventListener('click', () => {
      this.showHistory();
    });

    // 模型切换按钮事件
    if (modelBtn) {
      modelBtn.addEventListener('click', () => {
        this.toggleModel();
      });
    }

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
      // 清空 originalImageUrl，确保在新生成结果页时使用正确的原图
      this.state.originalImageUrl = null;
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
    const mobileUploadButtons = document.getElementById('mobile-upload-buttons');

    if (this.state.photo) {
      previewArea.classList.add('has-image');
      previewImage.src = this.state.photoBase64;
      if (mobileUploadButtons) {
        mobileUploadButtons.classList.add('hidden');
      }
    } else {
      previewArea.classList.remove('has-image');
      previewImage.src = '';
      if (mobileUploadButtons) {
        mobileUploadButtons.classList.remove('hidden');
      }
    }
  }

  removePhoto() {
    this.state.photo = null;
    this.state.photoBase64 = null;
    this.state.originalImageUrl = null;
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

  // 切换模型
  toggleModel() {
    if (this.state.currentModel === 'ep-20260309025356-rp498') {
      this.state.currentModel = 'doubao-seedream-5-0-260128';
      document.getElementById('model-btn').querySelector('span').textContent = '5.0 lite';
    } else {
      this.state.currentModel = 'ep-20260309025356-rp498';
      document.getElementById('model-btn').querySelector('span').textContent = '4.5';
    }
    console.log('🔄 已切换模型:', this.state.currentModel);
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
          model: this.state.currentModel,
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
    // 使用 getBackendUrl() 获取正确的服务器地址（支持公网访问）
    const hairstyleFullPath = `images/${this.state.hairstylePath}`;
    const serverUrl = this.getBackendUrl() + '/generate';

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
          model: this.state.currentModel,
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
        this.state.originalImageUrl = data.originalImageUrl; // 保存原始图片 URL

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
        // 保存成功后，让缓存失效，下次加载时重新获取
        this.state.historyLoaded = false;
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

    // 显示对比按钮
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
      compareBtn.style.display = 'flex';
    }

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

  // 设置对比按钮（只绑定一次）
  setupCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    if (!compareBtn) return;

    // 检查是否已经绑定过事件
    if (compareBtn._compareEventsBound) {
      return; // 已经绑定过，不再重复绑定
    }

    const resultImage = document.getElementById('result-image');

    let isShowingOriginal = false;
    let pressTimer;

    const showOriginal = () => {
      const originalImage = this.state.photoBase64 || this.state.originalImageUrl;
      console.log('👀 显示原图:', originalImage);
      if (originalImage) {
        // 显示加载状态
        compareBtn.style.opacity = '0.5';

        // 检查是否已经预加载完成
        if (this.state.hiddenOriginalImg && this.state.hiddenOriginalImg.complete) {
          console.log('✅ 使用预加载完成的原图');
          resultImage.src = originalImage;
          compareBtn.style.opacity = '1';
        } else {
          console.log('📥 原图未预加载完成，继续加载');
          // 直接设置src，不覆盖onload/onerror事件
          resultImage.src = originalImage;
          // 用临时变量监听加载完成
          const tempImg = new Image();
          tempImg.onload = () => {
            console.log('✅ 原图加载完成并显示');
            compareBtn.style.opacity = '1';
          };
          tempImg.onerror = (error) => {
            console.error('❌ 原图加载失败:', error);
            compareBtn.style.opacity = '1';
            this.showToast('原图加载失败');
          };
          tempImg.src = originalImage;
        }
        isShowingOriginal = true;
      } else {
        console.warn('⚠️ 没有原图可以显示');
      }
    };

    const showResult = () => {
      if (this.state.resultImage) {
        console.log('👀 显示生成图:', this.state.resultImage);
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

    // 标记已绑定事件
    compareBtn._compareEventsBound = true;
  }

  saveResult() {
    // 使用生成图 URL（用户想要保存的是生成后的图片）
    const imageUrl = this.state.resultImage;
    if (!imageUrl) {
      this.showToast('没有可保存的图片');
      return;
    }

    // 检测是否是移动设备
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 如果是 base64，直接下载
    if (imageUrl.startsWith('data:')) {
      if (isMobile) {
        // 移动端：使用长按保存的方式
        this.openImageForSave(imageUrl);
      } else {
        // 桌面端：直接下载
        const link = document.createElement('a');
        link.download = `换发型_${Date.now()}.png`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('图片已保存');
      }
    } else {
      // 是 URL，移动端和桌面端都使用长按保存的方式
      this.openImageForSave(imageUrl);
    }
  }

  // 打开图片在新窗口，提示用户长按保存（移动端保存到相册）
  openImageForSave(imageUrl) {
    const newWindow = window.open(imageUrl, '_blank');
    if (newWindow) {
      this.showToast('已在新窗口打开图片，请长按图片并选择"保存到相册"');
    } else {
      // 如果弹窗被拦截，回退到下载
      this.downloadImageFromUrl(imageUrl);
    }
  }

  // 从 URL 下载图片（保持原始格式，不转换）- 仅用于桌面端
  async downloadImageFromUrl(url) {
    try {
      // 使用 fetch 获取图片二进制数据
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('下载失败');
      }

      // 直接获取 blob（保持原始格式）
      const blob = await response.blob();

      // 从 URL 提取文件名和扩展名
      const urlParts = url.split('/');
      let filename = urlParts[urlParts.length - 1] || `image_${Date.now()}`;

      // 如果文件名没有扩展名，从 Content-Type 推断
      if (!filename.includes('.')) {
        const contentType = blob.type; // 例如：'image/jpeg'
        const ext = contentType.split('/')[1] || 'jpg';
        filename = `image_${Date.now()}.${ext}`;
      }

      // 创建下载链接
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL
      URL.revokeObjectURL(blobUrl);

      this.showToast('图片已保存');
    } catch (error) {
      // 如果下载失败，回退到打开新窗口
      console.error('下载图片失败:', error);
      this.openImageForSave(url);
    }
  }

  // 配置后端服务器地址
  getBackendUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    console.log('🌐 getBackendUrl - hostname:', hostname, 'protocol:', protocol, 'port:', port);

    // 情况1：file:// 协议
    if (protocol === 'file:') {
      console.log('📁 file:// 协议，使用 localhost:3001');
      return 'http://localhost:3001';
    }

    // 情况2：localhost 或 127.0.0.1 访问（本地开发）
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🏠 本地开发环境，使用 localhost:3001');
      return 'http://localhost:3001';
    }

    // 情况3：其他局域网IP（如 192.168.x.x）
    if (hostname.startsWith('192.168.')) {
      console.log('📡 局域网访问，使用:', 'http://' + hostname + ':3001');
      return 'http://' + hostname + ':3001';
    }

    // 情况4：公网服务器（默认）
    console.log('🌍 公网服务器，使用:', 'http://' + hostname + ':3001');
    return 'http://' + hostname + ':3001';
  }

  // 加载历史记录
  async loadHistory(forceReload = false) {
    // 检查缓存是否有效（5分钟内不重新加载）
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟
    const now = Date.now();

    if (!forceReload && this.state.historyLoaded && (now - this.state.historyCacheTime) < CACHE_DURATION) {
      console.log('✅ 使用缓存的历史记录');
      return;
    }

    // 优先尝试从服务器加载
    try {
      const serverUrl = this.getBackendUrl() + '/history-list';
      console.log('🔍 尝试从服务器加载历史记录:', serverUrl);
      const response = await fetch(serverUrl);
      if (response.ok) {
        const data = await response.json();
        this.state.history = (data.records || []).map(record => {
          console.log('🖼️  历史记录（服务器）:', record.id, record.hairstyleName, record.imageUrl ? '有图片' : '无图片');
          // 如果是相对路径，转换为完整URL
          let fullImageUrl = record.imageUrl;
          if (fullImageUrl && fullImageUrl.startsWith('/')) {
            fullImageUrl = this.getBackendUrl() + fullImageUrl;
          }
          return {
            ...record,
            imageUrl: fullImageUrl
          };
        });
        // 按时间倒序排列（最新的在前）
        this.state.history.sort((a, b) => {
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
        console.log('✅ 从服务器加载历史记录:', this.state.history.length, '条');

        // 更新缓存状态
        this.state.historyLoaded = true;
        this.state.historyCacheTime = now;

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
        // 按时间倒序排列（最新的在前）
        this.state.history.sort((a, b) => {
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
        console.log('✅ 从 localStorage 加载历史记录:', this.state.history.length, '条');

        // 更新缓存状态
        this.state.historyLoaded = true;
        this.state.historyCacheTime = now;
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
          this.state.photo = true; // 标记有照片
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

              // 隐藏上传按钮
              const mobileUploadButtons = document.getElementById('mobile-upload-buttons');
              if (mobileUploadButtons) {
                mobileUploadButtons.classList.add('hidden');
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
      item.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止冒泡到 header
        e.preventDefault(); // 阻止默认行为
        const id = parseInt(item.dataset.id);
        this.viewHistoryItem(id);
      });
    });

    this.showPage('history-page');
  }

  // 查看历史记录项（从服务器加载）
  async viewHistoryItem(id) {
    const now = Date.now();
    const CACHE_DURATION = this.state.historyDetailCacheTime;

    // 第一步：先显示页面和设置基本状态
    this.setupDetailPageUI(id);

    // 第二步：检查前端缓存
    if (this.state.historyDetailCache[id] && (now - this.state.historyDetailCache[id].time) < CACHE_DURATION) {
      console.log('✅ 使用缓存的历史记录详情:', id);
      this.updateDetailPageContent(this.state.historyDetailCache[id].data);
      return;
    }

    // 第三步：从服务器获取记录详情
    try {
      const serverUrl = this.getBackendUrl() + '/history/' + id;
      const response = await fetch(serverUrl);
      if (response.ok) {
        const record = await response.json();

        // 处理图片URL，转换为完整URL
        if (record.imageUrl && !record.imageUrl.startsWith('http')) {
          record.imageUrl = this.getBackendUrl() + record.imageUrl;
        }
        if (record.originalImage && !record.originalImage.startsWith('http')) {
          record.originalImage = this.getBackendUrl() + record.originalImage;
        }

        // 更新前端缓存
        this.state.historyDetailCache[id] = {
          data: record,
          time: now
        };

        // 更新页面内容
        this.updateDetailPageContent(record);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      this.showToast('加载失败');
    }
  }

  // 设置详情页 UI（先显示页面）
  setupDetailPageUI(id) {
    // 设置标记，让主事件处理器知道当前在详情页
    this.isInDetailPage = true;

    // 清空之前的图片和状态
    this.state.resultImage = null;
    this.state.originalImageUrl = null;
    this.state.photoBase64 = null;

    // 先显示结果页面（不等待数据）
    this.showPage('result-page');

    // 显示加载状态
    const resultImage = document.getElementById('result-image');
    if (resultImage) {
      resultImage.src = ''; // 清空
      resultImage.alt = '加载中...';
    }

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

    // 详情页不显示保存按钮，但显示对比按钮
    const compareBtn = document.getElementById('compare-btn');
    const saveBtn = document.getElementById('save-btn');
    if (compareBtn) compareBtn.style.display = 'none'; // 先隐藏，有数据时再显示
    if (saveBtn) saveBtn.style.display = 'none'; // 详情页不显示保存按钮

    // 设置对比按钮事件
    this.setupCompareButton();
  }

  // 更新详情页内容（数据加载完成后调用）
  updateDetailPageContent(record) {
    console.log('📋 更新详情页内容:', record);

    this.state.resultImage = record.imageUrl;
    // 兼容云端服务器返回的 originalImage 和之前的 originalImageUrl
    let originalImageUrl = record.originalImage || record.originalImageUrl;

    // 如果是相对路径，转换为完整URL
    if (originalImageUrl && !originalImageUrl.startsWith('http') && !originalImageUrl.startsWith('data:')) {
      originalImageUrl = this.getBackendUrl() + originalImageUrl;
    }

    this.state.originalImageUrl = originalImageUrl;
    this.state.hairstyleImagePath = this.state.hairstylePath; // 保存发型图路径
    // 清空 photoBase64，确保查看原图时使用历史记录的原图而不是之前上传的
    this.state.photoBase64 = null;

    console.log('🖼️  生成图 URL:', this.state.resultImage);
    console.log('🖼️  原图 URL:', this.state.originalImageUrl);
    console.log('🖼️  发型图路径:', this.state.hairstyleImagePath);

    // 创建隐藏的图片元素来加载原图（确保完整加载）
    if (this.state.originalImageUrl) {
      if (!this.state.hiddenOriginalImg) {
        this.state.hiddenOriginalImg = new Image();
      }
      this.state.hiddenOriginalImg.onload = () => {
        console.log('✅ 原图加载完成:', this.state.originalImageUrl);
      };
      this.state.hiddenOriginalImg.onerror = (error) => {
        console.error('❌ 原图加载失败:', this.state.originalImageUrl, error);
      };
      this.state.hiddenOriginalImg.src = this.state.originalImageUrl;
      console.log('📥 开始加载原图:', this.state.originalImageUrl);
    }

    // 显示图片
    const resultImage = document.getElementById('result-image');
    if (resultImage) {
      resultImage.alt = record.hairstyleName || '生成图';

      // 先清除旧的事件监听器
      resultImage.onload = null;
      resultImage.onerror = null;

      // 添加加载事件监听
      resultImage.onload = () => {
        console.log('✅ 生成图加载完成');
      };
      // resultImage.onerror = () => {
      //   console.error('❌ 生成图加载失败');
      //   this.showToast('生成图加载失败');
      // };

      // 只有当src真的变化时才设置，避免重复触发事件
      if (resultImage.src !== this.state.resultImage) {
        console.log('📥 开始加载生成图:', this.state.resultImage);
        resultImage.src = this.state.resultImage;
      } else {
        console.log('📥 生成图URL未变化，跳过重新加载');
      }
    }

    // 显示对比按钮
    const compareBtn = document.getElementById('compare-btn');
    const hasOriginalImage = this.state.originalImageUrl || this.state.photoBase64;
    if (compareBtn) compareBtn.style.display = hasOriginalImage ? 'flex' : 'none';

    // 更新标题
    const headerTitle = document.querySelector('#result-page h2');
    if (headerTitle) {
      headerTitle.textContent = record.hairstyleName || '历史记录';
    }

    // 添加缩略图区域（按住替换功能）
    this.addDetailThumbnails(record);
  }

  // 添加详情页缩略图（原图和发型图）
  addDetailThumbnails(record) {
    // 移除旧的缩略图区域（如果有）
    const oldThumbnails = document.getElementById('detail-thumbnails');
    if (oldThumbnails) {
      oldThumbnails.remove();
    }

    // 从 hairstyleName 提取发型编号（如"发型 1"或"发型 8" → "1"或"8"）
    let hairstyleNum = '1'; // 默认
    if (record.hairstyleName) {
      // 匹配"发型 X"格式，X 为数字（有无空格都可以）
      const match = record.hairstyleName.match(/发型\s*(\d+)/);
      if (match) {
        hairstyleNum = match[1];
      }
    }
    const hairstyleFileName = `hairstyle${hairstyleNum}.png`;
    const hairstyleThumbFileName = `hairstyle${hairstyleNum}_thumb.jpg`; // 缩略图

    console.log('📋 发型名称:', record.hairstyleName, '→ 文件名:', hairstyleFileName);

    // 创建缩略图区域
    const thumbnailsDiv = document.createElement('div');
    thumbnailsDiv.id = 'detail-thumbnails';
    thumbnailsDiv.className = 'detail-thumbnails';
    thumbnailsDiv.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 16px;
      margin-top: 16px;
    `;

    // 原图缩略图
    const originalThumb = document.createElement('div');
    originalThumb.style.cssText = `
      text-align: center;
      cursor: pointer;
    `;
    originalThumb.innerHTML = `
      <img src="${this.state.originalImageUrl || ''}" 
           style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e6ec;" 
           alt="原图">
      <div style="font-size: 12px; color: #7a7a8c; margin-top: 4px;">原图</div>
    `;

    // 发型图缩略图
    const hairstyleThumb = document.createElement('div');
    hairstyleThumb.style.cssText = `
      text-align: center;
      cursor: pointer;
    `;
    hairstyleThumb.innerHTML = `
      <img src="images/${hairstyleThumbFileName}" 
           style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e6ec;" 
           alt="发型图">
      <div style="font-size: 12px; color: #7a7a8c; margin-top: 4px;">发型</div>
    `;

    thumbnailsDiv.appendChild(originalThumb);
    thumbnailsDiv.appendChild(hairstyleThumb);

    // 添加到页面（在 result-content 中）
    const resultContent = document.querySelector('.result-content');
    if (resultContent) {
      resultContent.appendChild(thumbnailsDiv);
    }

    // 绑定按住替换事件
    this.bindThumbnailEvents(originalThumb, hairstyleThumb, hairstyleFileName);
  }

  // 绑定缩略图按住替换事件
  bindThumbnailEvents(originalThumb, hairstyleThumb, hairstyleFileName) {
    const resultImage = document.getElementById('result-image');
    if (!resultImage) return;

    const hairstyleNum = hairstyleFileName.replace('hairstyle', '').replace('.png', '');
    const hairstyleThumbFileName = `hairstyle${hairstyleNum}_thumb.jpg`; // 缩略图

    const originalSrc = this.state.resultImage; // 生成图
    const originalImgSrc = this.state.originalImageUrl; // 原图
    const hairstyleSrc = `images/${hairstyleThumbFileName}`; // 发型缩略图（放大显示）

    // 按住原图缩略图：显示原图
    const showOriginal = () => {
      resultImage.src = originalImgSrc;
    };
    const restoreResult = () => {
      resultImage.src = originalSrc;
    };

    // 按住发型图缩略图：显示发型缩略图（放大）
    const showHairstyle = () => {
      resultImage.src = hairstyleSrc;
    };

    // 原图缩略图事件（移动端和桌面端）
    originalThumb.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showOriginal();
    });
    originalThumb.addEventListener('touchend', restoreResult);
    originalThumb.addEventListener('touchcancel', restoreResult);
    originalThumb.addEventListener('mousedown', showOriginal);
    originalThumb.addEventListener('mouseup', restoreResult);
    originalThumb.addEventListener('mouseleave', restoreResult);

    // 发型图缩略图事件（移动端和桌面端）
    hairstyleThumb.addEventListener('touchstart', (e) => {
      e.preventDefault();
      showHairstyle();
    });
    hairstyleThumb.addEventListener('touchend', restoreResult);
    hairstyleThumb.addEventListener('touchcancel', restoreResult);
    hairstyleThumb.addEventListener('mousedown', showHairstyle);
    hairstyleThumb.addEventListener('mouseup', restoreResult);
    hairstyleThumb.addEventListener('mouseleave', restoreResult);
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
