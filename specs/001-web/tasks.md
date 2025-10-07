# Tasks: 磁检测仪器Web界面系统

**Feature**: 001-web | **Branch**: `001-web` | **Date**: 2025-10-07  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Summary

**总任务数**: 68个任务  
**预计开发时间**: 14-18天  
**MVP范围**: Phase 3-5 (US1-US3, 共28个任务)  
**可并行任务**: 32个 (标记为[P])

**任务分组**:
- Phase 1 (Setup): 6个任务
- Phase 2 (Foundational): 8个任务  
- Phase 3 (US1 - P1): 8个任务 ⭐ MVP
- Phase 4 (US2 - P1): 7个任务 ⭐ MVP
- Phase 5 (US3 - P1): 7个任务 ⭐ MVP
- Phase 6 (US4 - P2): 6个任务
- Phase 7 (US5 - P2): 6个任务
- Phase 8 (US6 - P2): 5个任务
- Phase 9 (US7 - P3): 5个任务
- Phase 10 (US8 - P3): 5个任务
- Phase 11 (US9 - P3): 3个任务
- Phase 12 (Polish): 2个任务

---

## Phase 1: Setup - 项目初始化

**目标**: 创建项目基础结构和配置文件

**依赖**: 无  
**预计时间**: 0.5天

### T001: 创建项目目录结构 [P]
**描述**: 创建所有必需的目录  
**文件**: 项目根目录  
**操作**:
```bash
mkdir -p css js assets/images assets/sounds lib database tests docs
```
**验收**: 所有目录创建完成

### T002: 创建.gitignore文件 [P]
**描述**: 配置Git忽略规则  
**文件**: `.gitignore`  
**内容**: 已完成 ✅  
**验收**: 文件存在且包含node_modules、.env等规则

### T003: 创建package.json [P]
**描述**: 配置npm脚本和依赖  
**文件**: `package.json`  
**内容**: 已完成 ✅  
**验收**: 包含dev和start脚本

### T004: 创建环境变量文件 [P]
**描述**: 配置Supabase连接信息  
**文件**: `.env`, `.env.example`  
**内容**: 已完成 ✅  
**验收**: 包含SUPABASE_URL和ANON_KEY

### T005: 创建netlify.toml配置 [P]
**描述**: 配置Netlify部署参数  
**文件**: `netlify.toml`  
**内容**: 已完成 ✅  
**验收**: 包含build、redirects、headers配置

### T006: 创建README.md [P]
**描述**: 编写项目说明文档  
**文件**: `README.md`  
**内容**: 已完成 ✅  
**验收**: 包含项目简介、快速开始、功能列表

**✅ Phase 1 Checkpoint**: 项目结构和配置文件就绪

---

## Phase 2: Foundational - 基础框架

**目标**: 创建所有用户故事共享的基础设施

**依赖**: Phase 1完成  
**预计时间**: 1天

### T007: 创建config.js配置模块 [P]
**描述**: 定义应用常量和Supabase连接配置  
**文件**: `js/config.js`  
**内容**: 已完成 ✅  
**要点**:
- Supabase URL和API Key
- 应用常量（采样率、增益级别、颜色等）
- 缺陷类型枚举
**验收**: 配置对象正确导出，可在其他模块中引用

### T008: 创建utils.js工具函数模块 [P]
**描述**: 实现通用工具函数  
**文件**: `js/utils.js`  
**内容**: 已完成 ✅  
**要点**:
- 日期格式化
- 防抖节流
- 通知提示
- LocalStorage操作
- 模拟信号生成器
**验收**: 所有工具函数可独立调用

### T009: 创建supabase-client.js数据库客户端 [P]
**描述**: 封装Supabase API调用  
**文件**: `js/supabase-client.js`  
**内容**: 已完成 ✅  
**要点**:
- 初始化Supabase客户端
- 实验CRUD操作
- 信号数据操作
- 缺陷记录操作
- 实时订阅
**验收**: 可以成功连接Supabase并执行查询

### T010: 应用Supabase数据库schema
**描述**: 在Supabase中创建所有数据表  
**文件**: `database/schema.sql`  
**内容**: 已完成 ✅  
**操作**:
1. 登录Supabase Web界面
2. 进入SQL Editor
3. 执行schema.sql脚本
4. 验证所有表和索引创建成功
**验收**: 8个数据表（users, experiments, signal_data, defects等）创建完成

### T011: 配置Supabase RLS策略
**描述**: 设置行级安全策略  
**文件**: `database/schema.sql` (RLS部分)  
**操作**:
1. 为每个表启用RLS
2. 创建SELECT/INSERT/UPDATE/DELETE策略
3. 测试策略生效
**验收**: 用户只能访问自己的数据，管理员可访问所有数据

### T012: 创建主HTML结构框架
**描述**: 创建index.html基础结构  
**文件**: `index.html`  
**要点**:
- HTML5 doctype
- meta标签（viewport、charset）
- 引入CDN库（ECharts、Supabase、jsPDF、xlsx）
- 引入本地CSS和JS文件
- 创建基础DOM结构（header、main、footer）
**验收**: 页面可以在浏览器中打开，无错误

### T013: 创建main.css主样式文件 [P]
**描述**: 定义全局样式和CSS变量  
**文件**: `css/main.css`  
**要点**:
- CSS变量定义（颜色、字体、间距）
- Reset样式
- 通用类（flex、grid、按钮、表单）
- 响应式断点
**验收**: 样式文件加载正常，CSS变量可用

### T014: 创建app.js应用主逻辑框架
**描述**: 实现应用初始化和视图管理  
**文件**: `js/app.js`  
**要点**:
- DOMContentLoaded事件监听
- Supabase客户端初始化
- 视图切换逻辑
- 全局错误处理
**验收**: 页面加载后app.js正确执行，Console无错误

**✅ Phase 2 Checkpoint**: 基础框架就绪，可以开始用户故事开发

---

## Phase 3: User Story 1 (P1) - 实时磁信号监测与波形显示 ⭐ MVP

**故事目标**: 作为无损检测工程师，我需要实时监控磁信号波形

**独立测试标准**:
- ✅ 波形图实时更新（≥30fps）
- ✅ 双通道信号同时显示
- ✅ 信号幅值超过阈值时自动标记
- ✅ 波形可缩放、平移、标注

**依赖**: Phase 2完成  
**预计时间**: 2天

### T015: [US1] 创建signal-chart.js模块 [P]
**描述**: 实现磁信号波形图表组件  
**文件**: `js/signal-chart.js`  
**要点**:
- 初始化ECharts实例
- 配置双通道折线图
- 实现实时数据更新接口
- 实现缩放平移功能
- 实现缺陷标记功能
**代码结构**:
```javascript
class SignalChart {
  constructor(containerId) {
    this.chart = echarts.init(document.getElementById(containerId), 'dark');
    this.initChart();
  }
  
  initChart() {
    // 配置ECharts option
  }
  
  updateData(channel, newData) {
    // 更新波形数据
  }
  
  markDefect(position, amplitude) {
    // 标记缺陷位置
  }
}
```
**验收**: 可以创建图表实例并显示静态波形

### T016: [US1] 实现模拟信号数据生成器
**描述**: 在utils.js中实现信号生成函数  
**文件**: `js/utils.js`  
**内容**: 已完成 ✅ (generateMockSignalData函数)  
**验收**: 可以生成符合真实特征的波形数据

### T017: [US1] 在index.html中添加波形显示区域
**描述**: 创建主屏幕波形图容器  
**文件**: `index.html`  
**要点**:
```html
<div id="main-display" class="main-display">
  <div id="signal-chart" class="signal-chart"></div>
</div>
```
**验收**: 容器元素存在且有正确的ID

### T018: [US1] 创建波形图样式
**描述**: 定义波形图的CSS样式  
**文件**: `css/main.css`  
**要点**:
```css
.signal-chart {
  width: 100%;
  height: 600px;
  background-color: #1a1a1a;
  border: 2px solid #444;
}
```
**验收**: 波形图区域显示正确且符合工业风格

### T019: [US1] 实现实时波形更新逻辑
**描述**: 在app.js中实现定时更新波形  
**文件**: `js/app.js`  
**要点**:
```javascript
let signalChart;
let updateInterval;

function startSignalMonitoring() {
  signalChart = new SignalChart('signal-chart');
  
  updateInterval = setInterval(() => {
    const newData = Utils.generateMockSignalData(10, 50);
    signalChart.updateData(1, newData);
  }, 100); // 每100ms更新一次
}
```
**验收**: 波形图实时更新，无卡顿

### T020: [US1] 实现双通道信号切换
**描述**: 添加通道切换UI和逻辑  
**文件**: `index.html`, `js/app.js`  
**要点**:
- 添加通道1/通道2切换按钮
- 实现切换逻辑
- 不同通道使用不同颜色（绿色/蓝色）
**验收**: 可以切换查看不同通道的波形

### T021: [US1] 实现缺陷自动标记功能
**描述**: 检测信号幅值超过阈值并标记  
**文件**: `js/signal-chart.js`, `js/app.js`  
**要点**:
```javascript
function detectDefects(data, threshold = 80) {
  data.forEach(point => {
    if (point.amplitude > threshold) {
      signalChart.markDefect(point.timestamp, point.amplitude);
    }
  });
}
```
**验收**: 超过阈值的信号点自动标记为红色

### T022: [US1] 添加顶部数据表格显示
**描述**: 显示实时信号参数  
**文件**: `index.html`, `css/main.css`, `js/app.js`  
**要点**:
```html
<div class="data-table-header">
  <div class="param">当前幅值: <span id="current-amplitude">0</span> mV</div>
  <div class="param">峰值: <span id="peak-amplitude">0</span> mV</div>
  <div class="param">平均值: <span id="avg-amplitude">0</span> mV</div>
</div>
```
**验收**: 数据表格实时更新并显示正确的数值

**✅ Phase 3 Checkpoint**: US1完成，可以实时查看波形图

**独立测试**:
1. 打开页面，确认波形图显示
2. 观察波形是否实时更新（≥30fps）
3. 验证双通道可以切换
4. 验证缺陷自动标记功能
5. 验证顶部数据表格数值正确

---

## Phase 4: User Story 2 (P1) - 实验项目创建与数据记录 ⭐ MVP

**故事目标**: 作为质量控制主管，我需要创建标准化的检测实验项目

**独立测试标准**:
- ✅ 可以创建包含所有必需字段的实验
- ✅ 实验数据自动保存到云端
- ✅ 可以查询和加载历史实验
- ✅ 必填字段验证正常工作

**依赖**: Phase 2完成（不依赖US1）  
**预计时间**: 2天

### T023: [US2] 创建data-manager.js模块 [P]
**描述**: 实现实验数据管理逻辑  
**文件**: `js/data-manager.js`  
**要点**:
```javascript
class DataManager {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }
  
  async createExperiment(data) {
    // 验证数据
    // 调用supabaseClient.createExperiment
  }
  
  async loadExperiment(id) {
    // 加载实验并恢复状态
  }
  
  async searchExperiments(criteria) {
    // 搜索实验
  }
}
```
**验收**: 模块可以正确导出并实例化

### T024: [US2] 创建实验创建表单UI
**描述**: 添加新建实验表单HTML  
**文件**: `index.html`  
**要点**:
- 项目名称输入框（必填）
- 工件名称输入框（必填）
- 工件材料下拉框
- 检测标准输入框
- 操作员姓名输入框（必填）
- 操作员资质输入框
- 磁化方式单选框（必填）
- 磁化电流数字输入框
- 保存按钮、取消按钮
**验收**: 表单正确显示，所有输入元素可交互

### T025: [US2] 创建表单样式
**描述**: 设计表单的CSS样式  
**文件**: `css/main.css`  
**要点**:
- 表单容器样式（模态对话框）
- 输入框样式（工业风格）
- 标签样式
- 错误提示样式
**验收**: 表单外观符合工业化设计风格

### T026: [US2] 实现表单验证逻辑
**描述**: 验证表单输入数据  
**文件**: `js/data-manager.js`  
**要点**:
```javascript
function validateExperimentData(data) {
  const errors = [];
  if (!data.project_name) errors.push('项目名称不能为空');
  if (!data.workpiece_name) errors.push('工件名称不能为空');
  if (data.magnetization_current < 0 || data.magnetization_current > 2000) {
    errors.push('磁化电流应在0-2000mA之间');
  }
  return { isValid: errors.length === 0, errors };
}
```
**验收**: 无效数据被拒绝并显示错误提示

### T027: [US2] 实现实验创建和保存功能
**描述**: 连接表单和数据库  
**文件**: `js/app.js`, `js/data-manager.js`  
**要点**:
- 监听表单提交事件
- 收集表单数据
- 调用dataManager.createExperiment
- 显示成功/失败提示
**验收**: 提交表单后数据保存到Supabase

### T028: [US2] 创建实验列表视图
**描述**: 显示历史实验列表  
**文件**: `index.html`, `css/main.css`, `js/app.js`  
**要点**:
```html
<div id="experiment-list" class="experiment-list">
  <div class="experiment-item">
    <div class="exp-name">项目名称</div>
    <div class="exp-date">检测日期</div>
    <div class="exp-result">检测结果</div>
  </div>
</div>
```
**验收**: 可以显示实验列表，每个实验显示关键信息

### T029: [US2] 实现实验搜索功能
**描述**: 按条件搜索实验  
**文件**: `js/data-manager.js`, `js/app.js`  
**要点**:
- 添加搜索输入框
- 实现按项目名称、工件名称、日期范围搜索
- 实时过滤列表
**验收**: 搜索功能正常，响应时间<1秒

**✅ Phase 4 Checkpoint**: US2完成，可以创建和管理实验

**独立测试**:
1. 点击"新建实验"按钮，表单正确显示
2. 填写所有必填字段，点击保存
3. 验证数据保存到Supabase（在Supabase Web界面查看）
4. 刷新页面，实验列表正确显示
5. 测试搜索功能

---

## Phase 5: User Story 3 (P1) - 工业化控制界面操作 ⭐ MVP

**故事目标**: 作为仪器操作员，我需要直观的工业化界面

**独立测试标准**:
- ✅ 界面完全复现DOPPLER硬件外观
- ✅ 9个按钮（左6+右3）正确显示
- ✅ 按钮有悬停和点击效果
- ✅ 支持键盘快捷键

**依赖**: Phase 2完成（不依赖US1和US2）  
**预计时间**: 2天

### T030: [US3] 创建industrial.css工业风格样式 [P]
**描述**: 实现DOPPLER仪器外观  
**文件**: `css/industrial.css`  
**要点**:
- 橙色外壳边框（#FF6B00）
- 黑色机身背景（#1A1A1A）
- 金属质感效果（渐变、阴影）
- 按钮3D效果
- LED指示灯样式
**验收**: 页面呈现工业设备外观

### T031: [US3] 创建仪器外壳HTML结构
**描述**: 复现DOPPLER硬件布局  
**文件**: `index.html`  
**要点**:
```html
<div class="instrument-container">
  <div class="instrument-frame orange">
    <div class="instrument-body">
      <div class="button-panel-left"><!-- 6个按钮 --></div>
      <div class="main-display"><!-- 中央显示 --></div>
      <div class="button-panel-right"><!-- 3个按钮 --></div>
    </div>
    <div class="brand-logo">DOPPLER</div>
  </div>
</div>
```
**验收**: 布局与参考图片一致

### T032: [US3] 创建左侧功能按钮区域
**描述**: 6个橙色功能按钮  
**文件**: `index.html`, `css/industrial.css`  
**要点**:
- 播放/暂停按钮（▶图标）
- 上传按钮（↑图标）
- DISP按钮
- 接地按钮（⏚图标）
- GATE按钮
- VPA按钮
**验收**: 6个按钮正确显示，位置和样式符合参考图

### T033: [US3] 创建右侧控制按钮区域
**描述**: 3个橙色控制按钮  
**文件**: `index.html`, `css/industrial.css`  
**要点**:
- 回退按钮（↶图标）
- SAVE按钮
- MENU按钮
**验收**: 3个按钮正确显示，位置和样式符合参考图

### T034: [US3] 实现按钮交互效果
**描述**: 悬停高亮和点击下压效果  
**文件**: `css/industrial.css`, `js/app.js`  
**要点**:
```css
.btn-function:hover {
  background-color: #FF8C00;
  box-shadow: 0 0 10px rgba(255, 107, 0, 0.8);
}

.btn-function:active {
  transform: translateY(2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
```
**验收**: 鼠标悬停和点击有明显反馈

### T035: [US3] 添加按钮点击音效
**描述**: 播放按钮点击声音  
**文件**: `assets/sounds/button-click.mp3`, `js/utils.js`  
**要点**:
```javascript
function playButtonSound() {
  const audio = new Audio('/assets/sounds/button-click.mp3');
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Audio play blocked'));
}
```
**验收**: 点击按钮播放音效（可选功能）

### T036: [US3] 实现键盘快捷键支持
**描述**: 绑定F1-F6和Ctrl组合键  
**文件**: `js/app.js`  
**要点**:
```javascript
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'F1': triggerButton('play'); break;
    case 'F2': triggerButton('upload'); break;
    case 'F3': triggerButton('disp'); break;
    // ...
  }
  
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    triggerButton('save');
  }
});
```
**验收**: 按下快捷键触发对应按钮功能

**✅ Phase 5 Checkpoint**: US3完成，MVP交付

**MVP独立测试**:
1. 界面完整显示，与参考图片高度相似
2. 9个按钮全部可见且可交互
3. 按钮悬停、点击效果正常
4. 键盘快捷键正常工作
5. 波形图实时更新（US1）
6. 可以创建和查询实验（US2）

---

## Phase 6: User Story 4 (P2) - 缺陷记录与分析

**故事目标**: 作为检测工程师，我需要记录和分析缺陷

**依赖**: US1完成（需要波形图）  
**预计时间**: 1.5天

### T037: [US4] 添加缺陷记录表单UI [P]
**描述**: 创建缺陷记录表单  
**文件**: `index.html`, `css/main.css`  
**要点**:
- 缺陷类型下拉框（7种类型）
- 位置坐标输入（X、Y）
- 尺寸输入（长度、宽度）
- 严重程度选择（1-5星）
- 描述文本框
**验收**: 表单正确显示

### T038: [US4] 实现点击波形标记缺陷
**描述**: 在signal-chart.js中添加点击事件  
**文件**: `js/signal-chart.js`, `js/app.js`  
**要点**:
```javascript
chart.on('click', (params) => {
  const position = params.data[0];
  const amplitude = params.data[1];
  openDefectForm(position, amplitude);
});
```
**验收**: 点击波形图弹出缺陷记录表单

### T039: [US4] 实现缺陷数据保存
**描述**: 保存缺陷到Supabase  
**文件**: `js/data-manager.js`, `js/app.js`  
**要点**:
- 调用supabaseClient.createDefect
- 自动关联当前实验ID
- 更新实验的defect_count
**验收**: 缺陷数据成功保存

### T040: [US4] 创建缺陷列表视图 [P]
**描述**: 显示当前实验的所有缺陷  
**文件**: `index.html`, `css/main.css`, `js/app.js`  
**要点**:
- 列表显示缺陷编号、类型、位置、严重程度
- 点击缺陷在波形图上高亮显示
**验收**: 缺陷列表正确显示

### T041: [US4] 实现缺陷统计功能 [P]
**描述**: 计算缺陷统计数据  
**文件**: `js/data-manager.js`, `js/app.js`  
**要点**:
- 缺陷总数
- 各类型缺陷数量
- 缺陷密度（个/米）
- 合格率
**验收**: 统计数据正确计算并显示

### T042: [US4] 创建缺陷统计图表 [P]
**描述**: 使用ECharts显示统计图表  
**文件**: `js/app.js`  
**要点**:
- 饼图（缺陷类型分布）
- 柱状图（严重程度分布）
**验收**: 图表正确显示统计数据

**✅ Phase 6 Checkpoint**: US4完成

---

## Phase 7: User Story 5 (P2) - 参数配置与预设管理

**故事目标**: 作为资深工程师，我需要精确配置检测参数

**依赖**: Phase 2完成  
**预计时间**: 1.5天

### T043: [US5] 创建parameter-config.js模块 [P]
**描述**: 实现参数配置逻辑  
**文件**: `js/parameter-config.js`  
**验收**: 模块正确导出

### T044: [US5] 创建参数配置UI
**描述**: 参数配置表单  
**文件**: `index.html`, `css/main.css`  
**要点**:
- 磁化参数（电流、频率、时间）
- 增益参数（0-100dB）
- 门控参数（位置、宽度、阈值）
- 滤波器参数（类型选择）
**验收**: 表单显示所有可配置参数

### T045: [US5] 实现参数验证和应用
**描述**: 验证参数范围并应用到系统  
**文件**: `js/parameter-config.js`, `js/app.js`  
**要点**:
- 范围验证（如电流0-2000mA）
- 参数实时应用
- 参数变更记录到日志
**验收**: 参数变更立即生效

### T046: [US5] 实现配置预设保存功能 [P]
**描述**: 保存常用配置  
**文件**: `js/parameter-config.js`  
**要点**:
- 输入预设名称
- 保存到Supabase configurations表
- 列表显示所有预设
**验收**: 配置预设成功保存

### T047: [US5] 实现配置预设加载功能 [P]
**描述**: 从预设快速加载参数  
**文件**: `js/parameter-config.js`, `js/app.js`  
**要点**:
- 从Supabase读取预设
- 恢复所有参数值
- 显示确认消息
**验收**: 加载预设后参数正确恢复

### T048: [US5] 实现默认配置管理
**描述**: 设置和使用默认配置  
**文件**: `js/parameter-config.js`  
**要点**:
- 标记某个预设为默认
- 启动时自动加载默认配置
**验收**: 默认配置功能正常

**✅ Phase 7 Checkpoint**: US5完成

---

## Phase 8: User Story 6 (P2) - 文件管理与数据组织

**故事目标**: 作为项目经理，我需要组织管理检测文件

**依赖**: US2完成（需要实验数据）  
**预计时间**: 1.5天

### T049: [US6] 创建file-system.js模块 [P]
**描述**: 实现文件管理逻辑  
**文件**: `js/file-system.js`  
**验收**: 模块正确导出

### T050: [US6] 创建文件管理UI
**描述**: 树形文件浏览界面  
**文件**: `index.html`, `css/main.css`  
**要点**:
- 树形结构显示
- 文件类型图标
- 右键菜单（新建、删除、重命名）
**验收**: 文件树正确显示

### T051: [US6] 实现文件上传功能 [P]
**描述**: 上传文件到Supabase Storage  
**文件**: `js/file-system.js`, `js/app.js`  
**要点**:
```javascript
async function uploadFile(file, experimentId) {
  const path = `experiments/${experimentId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('experiments')
    .upload(path, file);
  
  // 保存文件记录到files表
}
```
**验收**: 文件成功上传到Supabase Storage

### T052: [US6] 实现文件搜索功能 [P]
**描述**: 按名称、类型搜索文件  
**文件**: `js/file-system.js`, `js/app.js`  
**验收**: 搜索功能正常，响应快速

### T053: [US6] 实现文件下载和导出
**描述**: 下载单个或批量文件  
**文件**: `js/file-system.js`  
**要点**:
- 单个文件直接下载
- 多个文件打包为ZIP
**验收**: 文件下载功能正常

**✅ Phase 8 Checkpoint**: US6完成

---

## Phase 9: User Story 7 (P3) - 检测报告生成与导出

**故事目标**: 作为质量经理，我需要生成符合标准的检测报告

**依赖**: US2、US4完成  
**预计时间**: 1.5天

### T054: [US7] 创建report-generator.js模块 [P]
**描述**: 实现PDF报告生成逻辑  
**文件**: `js/report-generator.js`  
**要点**:
- 引入jsPDF库
- 定义报告模板结构
**验收**: 模块正确导出

### T055: [US7] 实现PDF报告生成功能
**描述**: 生成ISO标准格式报告  
**文件**: `js/report-generator.js`  
**要点**:
```javascript
async function generateReport(experimentId) {
  const pdf = new jsPDF();
  
  // 封面
  pdf.text('磁检测报告', 105, 20, { align: 'center' });
  
  // 实验信息
  // 检测参数
  // 波形图（Canvas截图）
  // 缺陷列表
  // 统计分析
  // 结论
  
  pdf.save(`report-${experimentId}.pdf`);
}
```
**验收**: 生成的PDF包含所有必需章节

### T056: [US7] 添加报告生成按钮和UI [P]
**描述**: 在实验详情页添加"生成报告"按钮  
**文件**: `index.html`, `js/app.js`  
**验收**: 点击按钮后成功生成并下载PDF

### T057: [US7] 实现报告模板自定义 [P]
**描述**: 允许用户自定义报告样式  
**文件**: `js/report-generator.js`, `js/app.js`  
**要点**:
- 上传公司Logo
- 自定义页眉页脚
- 调整章节顺序
**验收**: 自定义设置生效

### T058: [US7] 实现批量报告生成 [P]
**描述**: 同时生成多个实验的报告  
**文件**: `js/report-generator.js`, `js/app.js`  
**验收**: 批量生成功能正常

**✅ Phase 9 Checkpoint**: US7完成

---

## Phase 10: User Story 8 (P3) - 多用户协作与权限管理

**故事目标**: 作为系统管理员，我需要管理用户权限

**依赖**: Phase 2完成  
**预计时间**: 1.5天

### T059: [US8] 创建auth.js认证模块 [P]
**描述**: 实现用户认证逻辑  
**文件**: `js/auth.js`  
**要点**:
- 登录函数
- 注册函数
- 登出函数
- 获取当前用户
**验收**: 认证功能正常工作

### T060: [US8] 创建登录注册UI
**描述**: 登录和注册表单  
**文件**: `index.html`, `css/main.css`  
**验收**: 表单显示正确

### T061: [US8] 实现角色权限控制
**描述**: 根据用户角色显示/隐藏功能  
**文件**: `js/app.js`, `js/auth.js`  
**要点**:
```javascript
function checkPermission(action, userRole) {
  const permissions = {
    admin: ['create', 'read', 'update', 'delete'],
    operator: ['create', 'read', 'update'],
    viewer: ['read']
  };
  return permissions[userRole].includes(action);
}
```
**验收**: 不同角色看到不同的功能

### T062: [US8] 创建用户管理界面（管理员） [P]
**描述**: 管理员可以管理所有用户  
**文件**: `index.html`, `js/app.js`  
**要点**:
- 用户列表
- 修改用户角色
- 禁用/启用账户
**验收**: 用户管理功能正常

### T063: [US8] 实现操作日志记录 [P]
**描述**: 记录所有用户操作  
**文件**: `js/app.js`, `js/supabase-client.js`  
**要点**:
```javascript
async function logAction(action, resourceType, resourceId) {
  await supabase.from('system_logs').insert({
    user_id: currentUser.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: await getClientIP()
  });
}
```
**验收**: 操作日志正确记录

**✅ Phase 10 Checkpoint**: US8完成

---

## Phase 11: User Story 9 (P3) - 数据导出与Excel分析

**故事目标**: 作为数据分析师，我需要导出Excel数据

**依赖**: US2、US4完成  
**预计时间**: 1天

### T064: [US9] 实现信号数据CSV导出 [P]
**描述**: 导出原始信号数据  
**文件**: `js/data-manager.js`  
**要点**:
```javascript
function exportSignalDataToCSV(data) {
  const csv = 'timestamp,channel,amplitude,frequency\n' +
    data.map(d => `${d.timestamp},${d.channel},${d.amplitude},${d.frequency}`).join('\n');
  Utils.downloadFile(new Blob([csv]), 'signal-data.csv');
}
```
**验收**: CSV文件正确生成并可在Excel中打开

### T065: [US9] 实现缺陷记录Excel导出 [P]
**描述**: 使用SheetJS导出Excel  
**文件**: `js/data-manager.js`  
**要点**:
```javascript
function exportDefectsToExcel(defects) {
  const ws = XLSX.utils.json_to_sheet(defects);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '缺陷记录');
  XLSX.writeFile(wb, 'defects.xlsx');
}
```
**验收**: Excel文件正确生成

### T066: [US9] 实现多实验汇总导出 [P]
**描述**: 导出多个实验的汇总Excel  
**文件**: `js/data-manager.js`  
**要点**:
- 每个实验一个Sheet
- 汇总Sheet显示统计数据
**验收**: 汇总Excel正确生成

**✅ Phase 11 Checkpoint**: US9完成，所有用户故事实现完毕

---

## Phase 12: Polish - 最终优化和部署

**目标**: 性能优化、用户体验提升、生产部署

**依赖**: 所有用户故事完成  
**预计时间**: 2天

### T067: 性能优化和测试
**描述**: 全面性能测试和优化  
**操作**:
1. Chrome DevTools Performance分析
2. 波形渲染优化（确保≥30fps）
3. 数据加载优化（分页、懒加载）
4. 图片压缩和CDN加速
5. 浏览器兼容性测试（Chrome/Edge/Firefox）
**验收**:
- [ ] 页面加载时间 < 3秒
- [ ] 波形渲染帧率 ≥ 30fps
- [ ] 数据保存响应 < 2秒
- [ ] 所有浏览器测试通过

### T068: 生产环境部署
**描述**: 部署到Netlify生产环境  
**操作**:
1. 确保所有代码已提交
2. 配置Netlify环境变量
3. 执行部署命令
4. 验证生产环境功能
5. 编写DEPLOYMENT.md文档
**验收**:
- [ ] 生产URL可访问
- [ ] 所有功能正常工作
- [ ] Supabase连接正常
- [ ] 部署文档完整

**✅ Phase 12 Checkpoint**: 项目完成，生产就绪 🎉

---

## Task Dependencies Graph

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundational) ← 所有用户故事的前置条件
  ↓
  ├─→ Phase 3 (US1 - 波形显示) ⭐ MVP
  │     ↓
  │   Phase 6 (US4 - 缺陷记录) ← 依赖US1
  │     ↓
  │   Phase 9 (US7 - 报告生成) ← 依赖US2+US4
  │   Phase 11 (US9 - 数据导出) ← 依赖US2+US4
  │
  ├─→ Phase 4 (US2 - 实验管理) ⭐ MVP
  │     ↓
  │   Phase 7 (US5 - 参数配置)
  │   Phase 8 (US6 - 文件管理) ← 依赖US2
  │   Phase 9 (US7 - 报告生成) ← 依赖US2+US4
  │   Phase 11 (US9 - 数据导出) ← 依赖US2+US4
  │
  └─→ Phase 5 (US3 - 工业界面) ⭐ MVP
      Phase 10 (US8 - 权限管理)
  
所有Phase完成后 → Phase 12 (Polish & Deployment)
```

---

## Parallel Execution Opportunities

### Setup阶段（Phase 1）
可以并行执行T001-T006，预计0.5天完成

### Foundational阶段（Phase 2）
- T007、T008、T009、T013可以并行（配置文件和工具模块）
- T010、T011必须串行（数据库创建）
- T012、T014可以并行

### MVP开发（Phase 3-5）
- US1、US2、US3相互独立，可以3人并行开发
- 每个US内部，标记[P]的任务可以并行

### P2功能（Phase 6-8）
- US4依赖US1，必须在US1后开发
- US5和US6相互独立，可以并行开发

### P3功能（Phase 9-11）
- US7和US9依赖US2+US4，必须最后开发
- US8相对独立，可以提前开发

---

## Implementation Strategy

### MVP优先（推荐）

**Week 1: MVP开发**
- Day 1: Phase 1+2 (Setup + Foundational)
- Day 2-3: Phase 3 (US1 - 波形显示)
- Day 4-5: Phase 4 (US2 - 实验管理)

**Week 2: MVP完成 + P2功能**
- Day 1-2: Phase 5 (US3 - 工业界面) → MVP交付 ✅
- Day 3: Phase 6 (US4 - 缺陷记录)
- Day 4: Phase 7 (US5 - 参数配置)
- Day 5: Phase 8 (US6 - 文件管理)

**Week 3: P3功能 + 部署**
- Day 1: Phase 9 (US7 - 报告生成)
- Day 2: Phase 10 (US8 - 权限管理)
- Day 3: Phase 11 (US9 - 数据导出)
- Day 4-5: Phase 12 (Polish & Deployment)

### 增量交付（推荐）

每完成一个Phase后立即测试和演示：
- ✅ Phase 1+2完成 → 基础框架演示
- ✅ Phase 3完成 → 波形显示演示
- ✅ Phase 4完成 → 实验管理演示
- ✅ Phase 5完成 → **MVP交付给用户试用**
- ✅ Phase 6-8完成 → P2功能演示
- ✅ Phase 9-11完成 → P3功能演示
- ✅ Phase 12完成 → 生产环境上线

---

## Testing Checklist

### MVP测试（Phase 3-5完成后）

**US1测试**:
- [ ] 波形图实时更新，帧率≥30fps
- [ ] 双通道信号可切换
- [ ] 缺陷自动标记功能正常
- [ ] 波形可缩放、平移
- [ ] 顶部数据表格显示正确

**US2测试**:
- [ ] 新建实验表单显示正常
- [ ] 必填字段验证生效
- [ ] 实验数据成功保存到Supabase
- [ ] 实验列表正确显示
- [ ] 搜索功能正常，响应<1秒

**US3测试**:
- [ ] 界面外观符合DOPPLER参考图
- [ ] 9个按钮全部可见且可点击
- [ ] 按钮悬停和点击效果正常
- [ ] 键盘快捷键正常工作
- [ ] 界面在不同分辨率下正确显示

### 完整功能测试（Phase 11完成后）

所有9个用户故事的验收场景测试

### 性能测试（Phase 12）

- [ ] 页面加载时间 < 3秒
- [ ] 波形渲染帧率 ≥ 30fps
- [ ] 数据保存响应 < 2秒
- [ ] 搜索查询响应 < 1秒

### 浏览器兼容性测试

- [ ] Chrome 90+ 测试通过
- [ ] Edge 90+ 测试通过
- [ ] Firefox 88+ 测试通过

---

## Success Metrics

完成所有68个任务后，系统应达到以下指标：

**功能完整性**:
- ✅ 9个用户故事100%实现
- ✅ 47个功能需求100%满足
- ✅ 22个成功标准100%达成

**代码质量**:
- ✅ 约5,000行JavaScript代码
- ✅ 约2,000行CSS代码
- ✅ 模块化组织，易于维护

**用户体验**:
- ✅ 工业化界面美观专业
- ✅ 操作流畅无卡顿
- ✅ 响应时间符合预期

**生产就绪**:
- ✅ 部署到Netlify
- ✅ Supabase数据库配置完成
- ✅ 完整的文档和测试

---

**任务列表生成人**: AI开发助手  
**生成时间**: 2025-10-07  
**文档版本**: v1.0  
**状态**: 准备就绪，可以开始开发 🚀
