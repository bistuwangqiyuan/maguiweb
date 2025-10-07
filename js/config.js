/**
 * 应用配置文件
 * 包含Supabase连接配置和应用常量
 */

const CONFIG = {
  // Supabase配置
  SUPABASE_URL: 'https://zzyueuweeoakopuuwfau.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4',
  
  // 应用常量
  APP_NAME: 'DOPPLER 磁检测仪器',
  APP_VERSION: '1.0.0',
  
  // 信号采集参数
  SIGNAL: {
    SAMPLE_RATE: 1000, // 采样率 (Hz)
    UPDATE_INTERVAL: 100, // 更新间隔 (ms)
    BUFFER_SIZE: 1000, // 缓冲区大小
    MAX_AMPLITUDE: 100, // 最大幅值 (mV)
  },
  
  // 增益级别
  GAIN_LEVELS: [1, 2, 5, 10, 20],
  
  // 磁化方式
  MAGNETIZATION_METHODS: [
    '直流磁化',
    '交流磁化',
    '脉冲磁化',
    '剩磁法'
  ],
  
  // 缺陷类型
  DEFECT_TYPES: [
    '裂纹',
    '气孔',
    '夹杂',
    '未熔合',
    '未焊透',
    '咬边',
    '错边'
  ],
  
  // 颜色配置
  COLORS: {
    PRIMARY: '#FF6B00',      // 橙色
    DARK: '#2A2A2A',         // 深灰
    BACKGROUND: '#1A1A1A',   // 黑色背景
    TEXT_PRIMARY: '#FFFFFF', // 白色文字
    SUCCESS: '#00FF00',      // 绿色
    WARNING: '#FFFF00',      // 黄色
    DANGER: '#FF0000',       // 红色
    CHANNEL1: '#00FF00',     // 通道1波形颜色
    CHANNEL2: '#0080FF',     // 通道2波形颜色
  },
  
  // 图表配置
  CHART: {
    REFRESH_RATE: 60, // 刷新率 (fps)
    GRID_COLOR: '#444444',
    AXIS_COLOR: '#888888',
  }
};

// 导出配置对象
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
