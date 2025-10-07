/**
 * 工具函数模块
 * 提供通用的辅助函数
 */

const Utils = {
  /**
   * 格式化日期时间
   * @param {Date|string} date - 日期对象或字符串
   * @param {string} format - 格式化模板
   * @returns {string} 格式化后的日期时间
   */
  formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 生成UUID
   * @returns {string} UUID字符串
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 延迟时间(ms)
   * @returns {Function} 节流后的函数
   */
  throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  },

  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 延迟时间(ms)
   * @returns {Function} 防抖后的函数
   */
  debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * 格式化数字（保留指定小数位）
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(num, decimals = 2) {
    return Number(num).toFixed(decimals);
  },

  /**
   * 显示通知消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success/warning/error/info)
   * @param {number} duration - 显示时长(ms)
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('notification--show'), 10);
    
    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('notification--show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },

  /**
   * 显示确认对话框
   * @param {string} message - 确认消息
   * @returns {boolean} 用户是否确认
   */
  confirm(message) {
    return confirm(message);
  },

  /**
   * 下载文件
   * @param {Blob} blob - 文件Blob对象
   * @param {string} filename - 文件名
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 生成模拟磁信号数据（用于演示）
   * @param {number} count - 数据点数量
   * @param {number} amplitude - 幅值
   * @returns {Array} 信号数据数组
   */
  generateMockSignalData(count = 100, amplitude = 50) {
    const data = [];
    for (let i = 0; i < count; i++) {
      const noise = (Math.random() - 0.5) * 5;
      const signal = amplitude * Math.sin(i * 0.1) + noise;
      
      // 随机添加缺陷信号
      if (Math.random() > 0.95) {
        data.push(signal + amplitude * 0.5);
      } else {
        data.push(signal);
      }
    }
    return data;
  },

  /**
   * 本地存储操作
   */
  storage: {
    /**
     * 保存数据到LocalStorage
     * @param {string} key - 键名
     * @param {*} value - 值
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('LocalStorage保存失败:', error);
      }
    },

    /**
     * 从LocalStorage读取数据
     * @param {string} key - 键名
     * @returns {*} 读取的值
     */
    get(key) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('LocalStorage读取失败:', error);
        return null;
      }
    },

    /**
     * 从LocalStorage删除数据
     * @param {string} key - 键名
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('LocalStorage删除失败:', error);
      }
    },

    /**
     * 清空LocalStorage
     */
    clear() {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('LocalStorage清空失败:', error);
      }
    }
  },

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * 播放按钮点击音效
   */
  playButtonSound() {
    // 可以后续添加音效文件
    // const audio = new Audio('/assets/sounds/button-click.mp3');
    // audio.play().catch(e => console.log('Audio play failed:', e));
  },

  /**
   * 获取缺陷严重程度描述
   * @param {number} severity - 严重程度(1-5)
   * @returns {string} 描述文本
   */
  getSeverityDescription(severity) {
    const descriptions = {
      1: '轻微',
      2: '一般',
      3: '中等',
      4: '严重',
      5: '危急'
    };
    return descriptions[severity] || '未知';
  },

  /**
   * 计算缺陷密度
   * @param {number} defectCount - 缺陷数量
   * @param {number} scanLength - 扫描长度(mm)
   * @returns {number} 缺陷密度(个/m)
   */
  calculateDefectDensity(defectCount, scanLength) {
    if (scanLength <= 0) return 0;
    return (defectCount / scanLength) * 1000;
  }
};
