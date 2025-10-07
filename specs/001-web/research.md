# Research & Technical Decisions: 磁检测仪器Web界面系统

**Feature**: 001-web | **Date**: 2025-10-07 | **Phase**: 0 - Research

---

## Overview

本文档记录了磁检测仪器Web界面系统开发过程中的关键技术研究和决策过程。所有决策都基于功能需求、性能目标和技术可行性的综合评估。

---

## Decision 1: 图表库选择

### 需求背景
系统核心功能之一是实时显示磁信号波形，需要：
- 支持大数据量（每秒1000个采样点）
- 流畅的实时渲染（≥30fps，目标60fps）
- 丰富的交互功能（缩放、平移、标注）
- 工业级可视化效果

### 候选方案

#### 方案A: Chart.js
**优点**:
- 轻量级（约200KB）
- 简单易用的API
- 良好的文档和社区支持
- 响应式设计

**缺点**:
- 大数据量性能不足（> 1000点开始卡顿）
- 交互能力有限
- 不支持流式数据更新
- 缺少工业级图表类型

#### 方案B: ECharts
**优点**:
- ✅ 工业级性能，支持10万+数据点流畅渲染
- ✅ 支持Canvas/SVG/WebGL多种渲染模式
- ✅ 内置数据流式更新机制
- ✅ 丰富的交互能力（dataZoom、tooltip、markPoint等）
- ✅ 完善的中文文档和社区
- ✅ 百度开源，在工业可视化领域应用广泛

**缺点**:
- 文件体积较大（约900KB），但可通过CDN和浏览器缓存缓解
- API相对复杂，但功能强大值得学习曲线

#### 方案C: D3.js
**优点**:
- 最强大的可视化库，完全自定义
- 性能优秀

**缺点**:
- 学习曲线陡峭
- 需要大量代码实现基础功能
- 开发周期长

### 决策结果

**选择方案B: ECharts** ✅

**理由**:
1. **性能满足**: 可以流畅渲染10万+数据点，远超项目需求
2. **功能完整**: 内置缩放、平移、标注等所需功能，无需额外开发
3. **工业应用**: 在能源、制造等工业领域有大量成功案例
4. **开发效率**: API清晰，可快速实现原型
5. **维护成本**: 活跃的社区和稳定的版本更新

**实施细节**:
```javascript
// 从CDN加载ECharts
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>

// 初始化波形图表
const chart = echarts.init(document.getElementById('signal-chart'), 'dark');
chart.setOption({
  animation: false, // 关闭动画提升性能
  xAxis: { type: 'value', name: '时间 (s)' },
  yAxis: { type: 'value', name: '幅值 (mV)' },
  series: [{
    type: 'line',
    data: signalData,
    smooth: false,
    symbol: 'none', // 不显示数据点标记
    lineStyle: { width: 1, color: '#00FF00' }
  }],
  dataZoom: [{ type: 'inside' }], // 支持鼠标滚轮缩放
  tooltip: { trigger: 'axis' } // 显示数据详情
});
```

---

## Decision 2: 数据来源策略

### 需求背景
Web应用无法直接连接硬件传感器采集磁信号数据，需要解决数据来源问题。

### 候选方案

#### 方案A: 纯模拟数据生成
**描述**: JavaScript生成符合真实特征的波形数据

**优点**:
- ✅ 无需外部依赖，随时可用
- ✅ 适合演示和培训
- ✅ 可控制缺陷位置和特征
- ✅ 实现简单

**缺点**:
- ❌ 无法分析真实采集的数据
- ❌ 模拟数据可能与真实数据存在差异

**实现示例**:
```javascript
function generateMockSignalData(duration, sampleRate) {
  const data = [];
  const time = duration; // 总时长（秒）
  const samples = time * sampleRate;
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // 基础正弦波（模拟正常磁场信号）
    const baseSignal = 50 * Math.sin(2 * Math.PI * 5 * t);
    
    // 添加高斯噪声
    const noise = (Math.random() - 0.5) * 5;
    
    // 随机添加缺陷信号（5%概率）
    const defect = Math.random() > 0.95 ? 30 * Math.sin(2 * Math.PI * 50 * t) : 0;
    
    data.push({
      timestamp: t,
      amplitude: baseSignal + noise + defect,
      frequency: 5,
      phase: 0
    });
  }
  
  return data;
}
```

#### 方案B: CSV文件导入
**描述**: 支持导入外部设备采集的CSV格式数据文件

**优点**:
- ✅ 可以分析真实采集的数据
- ✅ 适合生产环境使用
- ✅ 支持历史数据分析

**缺点**:
- ❌ 需要用户手动上传文件
- ❌ 依赖外部数据采集设备
- ❌ 文件格式需要标准化

**实现示例**:
```javascript
async function importCSVFile(file) {
  const text = await file.text();
  const lines = text.split('\n');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) { // 跳过表头
    const [timestamp, amplitude, frequency, phase] = lines[i].split(',');
    if (timestamp && amplitude) {
      data.push({
        timestamp: parseFloat(timestamp),
        amplitude: parseFloat(amplitude),
        frequency: parseFloat(frequency) || 0,
        phase: parseFloat(phase) || 0
      });
    }
  }
  
  return data;
}

// CSV文件格式示例：
// timestamp,amplitude,frequency,phase
// 0.001,45.2,5.0,0
// 0.002,46.8,5.0,0
// ...
```

#### 方案C: WebSocket实时数据流
**描述**: 通过WebSocket连接外部数据采集服务器

**优点**:
- 真正的实时数据采集
- 适合生产环境

**缺点**:
- ❌ 需要额外的数据采集服务器
- ❌ 复杂度高，不符合"纯前端"原则
- ❌ 超出项目范围

### 决策结果

**选择方案A + 方案B混合模式** ✅

**V1.0实现方案A**: 模拟数据生成器作为MVP功能

**V1.1扩展方案B**: 添加CSV文件导入支持

**理由**:
1. **分阶段实现**: V1.0专注核心功能，V1.1扩展真实数据支持
2. **灵活性**: 演示/培训使用模拟数据，生产使用真实数据
3. **简单性**: 模拟数据无需外部依赖，降低MVP复杂度
4. **可扩展性**: 预留接口，未来可支持更多数据来源（如API调用）

---

## Decision 3: 离线工作模式

### 需求背景
系统完全依赖Supabase云服务，网络中断时如何保证基本可用性？

### 候选方案

#### 方案A: 不支持离线
**描述**: 网络中断时显示错误提示，等待重连

**优点**:
- 实现简单
- 数据一致性高

**缺点**:
- 用户体验差
- 无法查看已缓存的数据

#### 方案B: LocalStorage临时缓存
**描述**: 使用LocalStorage缓存最近查看的数据

**优点**:
- ✅ 实现简单（几十行代码）
- ✅ 可以查看缓存数据
- ✅ 网络恢复后自动同步

**缺点**:
- 容量有限（5-10MB）
- 不支持创建新数据

#### 方案C: Service Worker + IndexedDB完整离线
**描述**: 使用Service Worker缓存应用资源，IndexedDB缓存数据

**优点**:
- 完整的离线支持
- 可以创建和编辑数据
- 容量大（几百MB）

**缺点**:
- 实现复杂度高
- 需要处理数据同步冲突
- 开发周期长

### 决策结果

**V1.0选择方案B**: LocalStorage基础缓存 ✅

**V1.1升级方案C**: 完整离线模式（可选）

**理由**:
1. **MVP优先**: V1.0专注核心功能，离线支持作为增强功能
2. **实用性**: 80%的使用场景是在线使用，基础缓存已满足临时断网需求
3. **复杂度**: 方案B只需50行代码，方案C需要500+行代码
4. **用户价值**: 方案B已能解决"查看最近数据"的核心需求

**实施细节**:
```javascript
// 自动缓存最近查看的实验数据
function cacheExperiment(experiment) {
  const cache = JSON.parse(localStorage.getItem('recent_experiments') || '[]');
  cache.unshift(experiment);
  if (cache.length > 10) cache.pop(); // 只保留最近10个
  localStorage.setItem('recent_experiments', JSON.stringify(cache));
}

// 离线时从缓存加载
function loadCachedExperiments() {
  if (!navigator.onLine) {
    const cache = JSON.parse(localStorage.getItem('recent_experiments') || '[]');
    return cache;
  }
  return null;
}

// 网络状态监听
window.addEventListener('online', () => {
  console.log('网络已恢复，自动同步数据...');
  syncOfflineData();
});

window.addEventListener('offline', () => {
  console.log('网络已断开，切换到离线模式');
  showOfflineNotification();
});
```

---

## Decision 4: 多语言国际化

### 需求背景
系统是否需要支持多语言（中文/英文）？

### 候选方案

#### 方案A: V1.0仅支持中文
**优点**:
- ✅ 实现简单
- ✅ 开发周期短
- ✅ 目标用户主要在中国

**缺点**:
- 无法服务国际用户

#### 方案B: V1.0同时支持中英文
**优点**:
- 国际化友好

**缺点**:
- 增加开发工作量
- 需要翻译所有文案
- 延长交付时间

### 决策结果

**V1.0选择方案A**: 仅支持中文 ✅

**V1.1添加国际化**: 使用i18n框架

**理由**:
1. **MVP原则**: 先验证核心功能，再扩展国际化
2. **目标市场**: 初期用户集中在中国市场
3. **快速迭代**: 尽快交付可用产品，根据反馈决定是否需要国际化
4. **技术预留**: 代码中文案集中管理，便于后续国际化

**预留接口**:
```javascript
// 集中管理所有文案
const texts = {
  app_title: '磁检测仪器控制系统',
  btn_new_experiment: '新建实验',
  btn_save: '保存',
  msg_save_success: '保存成功',
  // ... 其他文案
};

// 未来扩展为：
const texts = {
  zh: { app_title: '磁检测仪器控制系统', ... },
  en: { app_title: 'Magnetic Testing System', ... }
};
```

---

## Decision 5: 测试策略

### 需求背景
纯静态HTML页面如何进行测试？

### 候选方案

#### 方案A: 单元测试（Jest/Mocha）
**优点**:
- 自动化测试
- 测试覆盖率统计

**缺点**:
- 纯静态页面无需复杂单元测试
- 需要配置测试环境和构建工具
- 违反"简单性"原则

#### 方案B: 手动功能测试
**优点**:
- ✅ 实现简单
- ✅ 无需配置
- ✅ 直接在浏览器中验证用户体验

**缺点**:
- 非自动化
- 依赖人工

#### 方案C: E2E测试（Playwright/Cypress）
**优点**:
- 模拟真实用户操作
- 自动化

**缺点**:
- 配置复杂
- 学习曲线

### 决策结果

**选择方案B**: 手动功能测试 + 浏览器开发工具 ✅

**理由**:
1. **项目特性**: 纯静态页面，大部分逻辑是UI交互和数据展示
2. **简单性**: 无需配置测试框架和CI/CD
3. **实用性**: 手动测试可以同时验证功能和用户体验
4. **开发效率**: 节省测试框架配置时间，专注功能开发

**测试方法**:
- 编写详细的测试用例文档（tests/test-cases.md）
- 使用Chrome DevTools的Console、Network、Performance面板调试
- 每个用户故事完成后进行完整的验收场景测试
- 跨浏览器兼容性测试（Chrome、Edge、Firefox）

**测试用例示例**:
```markdown
## 测试用例: US1-001 实时波形显示

**前置条件**: 用户已登录系统

**测试步骤**:
1. 点击"开始扫描"按钮
2. 观察主显示区域波形图

**预期结果**:
- [ ] 波形图实时更新
- [ ] 刷新率 ≥ 30fps（使用Performance面板验证）
- [ ] 双通道信号同时显示
- [ ] 波形颜色正确（通道1绿色，通道2蓝色）

**实际结果**: _____________

**测试状态**: [ ] 通过 [ ] 失败 [ ] 阻塞
```

---

## Decision 6: 代码组织方式

### 需求背景
如何组织JavaScript代码以保持可维护性？

### 候选方案

#### 方案A: 所有代码写在一个JS文件
**优点**:
- 最简单

**缺点**:
- 代码量大后难以维护
- 功能耦合严重

#### 方案B: 按功能模块拆分JS文件
**优点**:
- ✅ 职责清晰
- ✅ 易于维护和扩展
- ✅ 多人协作友好

**缺点**:
- 需要在HTML中引入多个JS文件

### 决策结果

**选择方案B**: 模块化JavaScript ✅

**模块划分**:
```
js/
├── config.js            # 配置常量
├── supabase-client.js   # 数据库客户端
├── signal-chart.js      # 波形图表
├── data-manager.js      # 实验数据管理
├── file-system.js       # 文件管理
├── parameter-config.js  # 参数配置
├── report-generator.js  # 报告生成
├── auth.js              # 用户认证
├── utils.js             # 工具函数
└── app.js               # 主应用逻辑（最后加载）
```

**加载顺序**（在index.html中）:
```html
<!-- 1. 配置和工具 -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>

<!-- 2. 第三方库 -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 3. 功能模块 -->
<script src="js/supabase-client.js"></script>
<script src="js/signal-chart.js"></script>
<script src="js/data-manager.js"></script>
<!-- ... 其他模块 ... -->

<!-- 4. 主应用（最后加载，依赖其他模块） -->
<script src="js/app.js"></script>
```

---

## Best Practices Adopted

### 1. 响应式设计

**原则**: Mobile-First CSS（虽然暂不支持移动端，但保持良好习惯）

```css
/* 默认样式（桌面） */
.instrument-body {
  width: 1400px;
  height: 900px;
}

/* 大屏幕适配 */
@media (min-width: 2560px) {
  .instrument-body {
    width: 1800px;
    height: 1150px;
  }
}
```

### 2. 错误处理

**原则**: 用户友好的错误提示，不暴露技术细节

```javascript
try {
  const result = await supabase.from('experiments').insert(data);
  if (result.error) throw result.error;
  Utils.showNotification('实验创建成功', 'success');
} catch (error) {
  console.error('详细错误信息:', error); // 开发者可见
  Utils.showNotification('实验创建失败，请稍后重试', 'error'); // 用户可见
}
```

### 3. 性能优化

**原则**: 优先解决用户感知的性能问题

- ✅ 图片懒加载
- ✅ 按需加载数据（分页）
- ✅ 防抖和节流
- ✅ 浏览器缓存（Cache-Control头）

### 4. 安全实践

**原则**: 信任Supabase的安全机制，但仍做好前端防护

- ✅ 输入验证（前端验证+Supabase RLS双重保护）
- ✅ XSS防护（不使用innerHTML插入用户数据）
- ✅ HTTPS强制（Netlify默认）
- ✅ 敏感信息不暴露（API Key通过环境变量）

---

## Technology Stack Summary

| 层次 | 技术选择 | 理由 |
|------|---------|------|
| **前端框架** | 原生HTML/CSS/JS | 简单、AI友好、无构建工具 |
| **图表库** | ECharts 5.x | 工业级性能、丰富的交互 |
| **后端服务** | Supabase BaaS | 无需编写后端代码、内置认证和存储 |
| **数据库** | Supabase PostgreSQL | 关系型数据库、RLS安全 |
| **认证** | Supabase Auth | 邮箱密码登录、Session管理 |
| **文件存储** | Supabase Storage | 对象存储、公开/私有控制 |
| **报告生成** | jsPDF | 浏览器端PDF生成 |
| **数据导出** | SheetJS | Excel格式导出 |
| **部署平台** | Netlify | 静态托管、CDN加速、免费HTTPS |
| **版本控制** | Git | 行业标准 |

---

## Conclusion

所有关键技术决策已完成，技术栈选择合理且经过充分论证。项目采用最简单的技术方案（原生HTML/CSS/JS + Supabase BaaS），符合"简单性"和"AI友好"原则，同时满足性能和功能需求。

**技术风险**: 低  
**实施难度**: 中等  
**开发周期**: 14-18天  
**维护成本**: 低

**准备就绪**: ✅ 可以进入Phase 1（数据模型设计）和Phase 2（任务分解）

---

**文档创建人**: AI开发助手  
**创建时间**: 2025-10-07  
**文档版本**: v1.0
