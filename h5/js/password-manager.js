/**
 * 密码管理页面逻辑
 * HairSwap - 访问密码管理
 */

class PasswordManager {
  constructor() {
    this.init();
  }

  init() {
    this.loadStatus();
    this.bindEvents();
  }

  async loadStatus() {
    try {
      const response = await fetch('http://106.52.29.87:3001/api/password/status');
      const status = await response.json();

      const badge = document.getElementById('status-badge');
      const statusText = document.getElementById('status-text');
      const expiresText = document.getElementById('expires-text');
      const cardTitle = document.querySelector('.card-title');

      if (status.enabled) {
        badge.className = 'status-badge status-enabled';
        badge.textContent = '✅ 已启用';
        statusText.textContent = '已启用';
        
        // 更新标题显示当前密码
        if (cardTitle) {
          cardTitle.textContent = `当前密码 ${status.password || '****'}`;
        }
        
        if (status.expires) {
          const expiresDate = new Date(status.expires);
          const now = new Date();
          
          if (expiresDate > now) {
            expiresText.textContent = expiresDate.toLocaleString('zh-CN');
          } else {
            expiresText.textContent = '已过期 ❌';
            badge.className = 'status-badge status-disabled';
            badge.textContent = '⚠️ 已过期';
          }
        } else {
          expiresText.textContent = '永不过期';
        }
      } else {
        badge.className = 'status-badge status-disabled';
        badge.textContent = '🔓 未启用';
        statusText.textContent = '未启用';
        expiresText.textContent = '-';
        
        // 更新标题显示未启用
        if (cardTitle) {
          cardTitle.textContent = '当前密码（未启用）';
        }
      }
    } catch (error) {
      console.error('加载状态失败:', error);
      this.showMessage('加载状态失败：' + error.message, 'error');
    }
  }

  bindEvents() {
    document.getElementById('set-password-btn').addEventListener('click', () => this.setPassword());
    document.getElementById('disable-password-btn').addEventListener('click', () => this.disablePassword());
    document.getElementById('delete-password-btn').addEventListener('click', () => this.deletePassword());
  }

  async setPassword() {
    const passwordInput = document.getElementById('new-password');
    const expiresInput = document.getElementById('expires');
    const password = passwordInput.value.trim();

    if (!password || password.length !== 4 || !/^\d{4}$/.test(password)) {
      this.showMessage('密码必须是 4 位数字', 'error');
      return;
    }

    const btn = document.getElementById('set-password-btn');
    btn.disabled = true;
    btn.textContent = '设置中...';

    try {
      const expires = expiresInput.value ? new Date(expiresInput.value).toISOString() : null;

      const response = await fetch('http://106.52.29.87:3001/api/password/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, expires })
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('密码设置成功！', 'success');
        passwordInput.value = '';
        expiresInput.value = '';
        this.loadStatus();
      } else {
        this.showMessage('设置失败：' + result.message, 'error');
      }
    } catch (error) {
      this.showMessage('设置失败：' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '设置密码';
    }
  }

  async disablePassword() {
    if (!confirm('确定要禁用密码吗？禁用后无需密码即可访问。')) {
      return;
    }

    const btn = document.getElementById('disable-password-btn');
    btn.disabled = true;
    btn.textContent = '禁用中...';

    try {
      const response = await fetch('http://106.52.29.87:3001/api/password/disable', {
        method: 'PUT'
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('密码已禁用', 'success');
        this.loadStatus();
      } else {
        this.showMessage('禁用失败：' + result.message, 'error');
      }
    } catch (error) {
      this.showMessage('禁用失败：' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '禁用密码';
    }
  }

  async deletePassword() {
    if (!confirm('确定要删除密码吗？删除后将完全移除密码保护。')) {
      return;
    }

    const btn = document.getElementById('delete-password-btn');
    btn.disabled = true;
    btn.textContent = '删除中...';

    try {
      const response = await fetch('http://106.52.29.87:3001/api/password', {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('密码已删除', 'success');
        this.loadStatus();
      } else {
        this.showMessage('删除失败：' + result.message, 'error');
      }
    } catch (error) {
      this.showMessage('删除失败：' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '删除密码';
    }
  }

  showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = 'message message-' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// 初始化
new PasswordManager();
