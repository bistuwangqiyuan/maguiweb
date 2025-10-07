# Implementation Plan: 磁检测仪器Web界面系统

**Branch**: `001-web` | **Date**: 2025-10-07 | **Spec**: [spec.md](./spec.md)  
**Input**: 功能规格说明文档 `/specs/001-web/spec.md`

---

## Summary

**项目目标**: 开发一个纯Web端的磁检测仪器控制系统，完全复现DOPPLER工业级硬件设备的界面设计和核心功能，为NDT工程师提供符合ISO 9934-1:2016国际标准的专业磁检测解决方案。

**核心功能**: 
- 实时磁信号波形显示（双通道，60fps流畅渲染）
- 标准化实验项目管理（符合ISO 9934-1:2016）
- 工业化用户界面（橙色+黑色配色，仿真硬件按钮）

**技术方案**: 采用纯前端架构（HTML5 + CSS3 + JavaScript ES6+），无需任何后端代码，所有数据存储和业务逻辑通过Supabase BaaS平台实现。使用ECharts进行高性能波形渲染。

---

## Technical Context

**Language/Version**: 
- HTML5 + CSS3
- JavaScript ES6+ (无需编译，直接在现代浏览器运行)
- 目标浏览器: Chrome 90+, Edge 90+, Firefox 88+

**Primary Dependencies**: 
- **Supabase JavaScript Client** (v2.x) - 数据库、认证、存储服务
- **ECharts** (v5.x) - 高性能图表库，用于波形显示
- **jsPDF** (v2.x) - PDF报告生成
- **SheetJS (xlsx.js)** (v0.18.x) - Excel数据导出

**Storage**: 
- **Supabase PostgreSQL** - 主数据存储（实验数据、信号数据、缺陷记录、用户数据、配置）
- **Supabase Storage** - 文件存储（报告PDF、图像、数据文件）
- **LocalStorage** - 临时缓存和离线数据
- **IndexedDB** - 大容量本地数据缓存

**Testing**: 
- 无需单元测试框架（纯静态页面，测试通过手动功能验证和浏览器开发工具）
- 使用浏览器开发工具进行调试和性能分析
- 手动E2E测试覆盖所有用户故事的验收场景

**Target Platform**: 
- **Web浏览器**: 现代桌面浏览器（Chrome/Edge/Firefox最新版本）
- **屏幕分辨率**: 1920x1080及以上
- **网络环境**: 需要稳定的互联网连接访问Supabase服务
- **设备类型**: 桌面电脑或笔记本电脑（不考虑移动端适配）

**Project Type**: 
- **单页面Web应用 (SPA)** - 所有功能在单个HTML页面中实现，通过JavaScript动态切换视图

**Performance Goals**: 
- **页面加载时间**: < 3秒（4G网络环境）
- **波形渲染帧率**: ≥ 30fps（目标60fps）
- **数据保存响应**: < 2秒
- **搜索查询响应**: < 1秒
- **并发用户支持**: 100+ 用户同时访问

**Constraints**: 
- **纯前端实现**: 零后端代码，所有业务逻辑在浏览器端执行
- **静态托管**: 部署为静态网站（Netlify），无服务器端渲染
- **数据安全**: 依赖Supabase RLS（行级安全策略）保护数据
- **浏览器API依赖**: HTML5 Canvas、LocalStorage、Fetch API等
- **第三方服务可用性**: 完全依赖Supabase服务和CDN可用性

**Scale/Scope**: 
- **用户规模**: 10-100个并发用户
- **数据规模**: 每个实验最多100MB（约100万信号数据点）
- **实验数量**: 系统可管理1000+个历史实验
- **文件存储**: 初期100GB存储容量（可扩展）
- **代码规模**: 预计约5,000行JavaScript代码，2,000行CSS代码

---

## Constitution Check

*注意: 项目根目录的constitution.md为模板文件，暂无实际规范内容。以下检查基于用户规则和最佳实践。*

### 技术选型合规性

✅ **纯前端架构** - 符合用户要求"没有后端代码，后端全部通过Supabase实现"

✅ **简单技术栈** - 原生HTML/CSS/JS，无需构建工具，符合"越简单越好，对AI编程工具最友好"

✅ **无模拟数据** - 所有数据来自Supabase真实存储，符合"绝对不使用模拟数据回退机制"

✅ **标准遵循** - 实现符合ISO 9934-1:2016国际标准的检测流程

### 架构决策合规性

✅ **单一HTML文件** - 主界面为单页面应用，符合简单原则

✅ **模块化JavaScript** - 功能拆分为独立JS模块（config.js, supabase-client.js, signal-chart.js等），易于维护

✅ **CDN依赖** - 第三方库通过CDN加载，无需本地打包

### 开发流程合规性

✅ **文档优先** - 已完成PRD和README文档，符合"先文档后编码"原则

⚠️ **测试策略** - 采用手动功能测试而非自动化单元测试，考虑到纯静态HTML页面的特性，这是合理的权衡

---

## Project Structure

### Documentation (this feature)

```
specs/001-web/
├── spec.md                   # 功能规格说明（已完成）
├── plan.md                   # 本文件 - 技术设计
├── research.md               # 技术研究和决策文档
├── data-model.md             # 数据模型设计
├── quickstart.md             # 快速开始指南
├── checklists/
│   └── requirements.md       # 规格质量检查清单（已完成）
└── SUMMARY.md                # 规格完成报告（已完成）
```

### Source Code (repository root)

```
maguiweb/
├── index.html                # 主应用入口页面
│
├── css/                      # 样式文件
│   ├── main.css             # 主样式（布局、通用组件）
│   ├── industrial.css       # 工业风格样式（仿真硬件外观）
│   ├── responsive.css       # 响应式样式
│   └── animations.css       # 动画效果
│
├── js/                       # JavaScript模块
│   ├── config.js            # 应用配置（Supabase连接、常量）
│   ├── app.js               # 应用主逻辑（初始化、视图切换）
│   ├── supabase-client.js   # Supabase客户端封装
│   ├── signal-chart.js      # 磁信号波形图表模块
│   ├── data-manager.js      # 实验数据管理模块
│   ├── file-system.js       # 文件管理模块
│   ├── parameter-config.js  # 参数配置模块
│   ├── report-generator.js  # 报告生成模块
│   ├── auth.js              # 用户认证模块
│   └── utils.js             # 工具函数
│
├── assets/                   # 静态资源
│   ├── images/              # 图片资源
│   │   ├── icons/          # 图标
│   │   ├── buttons/        # 按钮图片
│   │   └── logo/           # Logo
│   ├── fonts/               # 字体文件（如需自定义字体）
│   └── sounds/              # 音效文件（按钮点击音）
│
├── lib/                      # 第三方库（CDN备份）
│   ├── echarts.min.js
│   ├── jspdf.min.js
│   └── xlsx.min.js
│
├── database/                 # 数据库脚本
│   ├── schema.sql           # Supabase数据库架构（已完成）
│   ├── migrations/          # 数据库迁移脚本
│   └── seeds/               # 种子数据
│
├── docs/                     # 项目文档
│   ├── PRD.md               # 产品需求文档（已完成）
│   ├── README.md            # 项目说明文档（已完成）
│   ├── API.md               # Supabase API调用文档
│   ├── DATABASE.md          # 数据库设计文档
│   └── DEPLOYMENT.md        # 部署文档
│
├── tests/                    # 测试文档和脚本
│   ├── test-cases.md        # 测试用例文档
│   └── manual-test.md       # 手动测试检查清单
│
├── .env.example              # 环境变量示例（已完成）
├── .env                      # 环境变量（已完成）
├── .gitignore                # Git忽略文件（已完成）
├── netlify.toml              # Netlify配置（已完成）
├── package.json              # 依赖管理（已完成）
└── README.md                 # 项目根README（已完成）
```

**Structure Decision**: 

选择**单页面Web应用 (SPA)** 结构，原因：

1. **简单性**: 所有功能在一个HTML页面中，无需路由配置，符合"越简单越好"原则
2. **性能**: 减少页面跳转，所有资源一次加载完成
3. **工业设备仿真**: 真实硬件设备是单屏幕界面，SPA可以完美复现这种体验
4. **状态管理**: 单页面便于管理全局应用状态（当前实验、波形数据等）
5. **AI友好**: 单文件HTML更容易被AI编程工具理解和修改

---

## Complexity Tracking

*本项目无Constitution规范违规，不需要填写此部分。*

项目采用最简单的技术栈（原生HTML/CSS/JS），无复杂框架和构建工具，符合简单性原则。

---

## Phase 0: Research & Decisions

详见 [research.md](./research.md)

关键技术决策：
1. ✅ **图表库选择**: ECharts (vs Chart.js) - 更强大的性能和工业级可视化能力
2. ✅ **数据来源**: 同时支持模拟数据生成和CSV文件导入
3. ✅ **离线策略**: V1.0基础缓存，V1.1完整离线支持
4. ✅ **多语言**: V1.0仅中文，V1.1添加国际化框架

---

## Phase 1: Data Model & Contracts

### Data Model

详见 [data-model.md](./data-model.md)

核心实体：
- **experiments** - 实验项目表
- **signal_data** - 磁信号数据表
- **defects** - 缺陷记录表
- **configurations** - 参数配置表
- **users** - 用户表
- **files** - 文件管理表
- **system_logs** - 系统日志表
- **calibration_records** - 设备校准记录表

### API Contracts

由于采用Supabase BaaS架构，无需定义传统的REST API契约。所有数据访问通过Supabase Client SDK进行，契约由Supabase自动生成。

**Supabase Client操作示例**:

```javascript
// 创建实验
await supabase
  .from('experiments')
  .insert(experimentData)
  .select()
  .single();

// 查询实验列表
await supabase
  .from('experiments')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);

// 实时订阅
supabase
  .channel('experiments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'experiments'
  }, callback)
  .subscribe();
```

### Quick Start Guide

详见 [quickstart.md](./quickstart.md)

---

## Implementation Strategy

### MVP范围 (Minimum Viable Product)

**MVP = P1优先级的三个用户故事**:

1. ✅ **US1**: 实时磁信号监测与波形显示
2. ✅ **US2**: 实验项目创建与数据记录
3. ✅ **US3**: 工业化控制界面操作

**MVP交付标准**:
- 完整的工业化界面（橙色+黑色，9个按钮，品牌Logo）
- 双通道波形实时显示（模拟数据生成器）
- 实验项目CRUD操作（云端存储）
- 用户可以独立完成一次完整的检测实验流程

**MVP不包含**（作为后续迭代）:
- 缺陷记录和分析（P2）
- 参数配置和预设管理（P2）
- 文件管理系统（P2）
- 报告生成（P3）
- 数据导出（P3）
- 权限管理（P3）

### 开发顺序

**第一阶段: 基础框架** (1天)
1. 创建index.html主页面结构
2. 实现工业化CSS样式（industrial.css）
3. 配置Supabase连接（config.js, supabase-client.js）
4. 实现基础布局和响应式设计

**第二阶段: 工业化界面** (1-2天)
5. 实现左侧6个功能按钮（播放、上传、DISP、接地、GATE、VPA）
6. 实现右侧3个控制按钮（回退、SAVE、MENU）
7. 添加按钮交互效果（悬停、点击、音效）
8. 实现键盘快捷键支持

**第三阶段: 波形显示** (2天)
9. 集成ECharts库
10. 实现信号波形图表组件（signal-chart.js）
11. 实现模拟信号数据生成器
12. 实现波形实时更新（30-60fps）
13. 实现波形交互（缩放、平移、标注）

**第四阶段: 实验管理** (2天)
14. 实现实验创建表单UI
15. 实现Supabase数据CRUD操作（data-manager.js）
16. 实现实验列表和搜索功能
17. 实现实验数据自动保存

**第五阶段: MVP集成测试** (1天)
18. 端到端功能测试
19. 性能优化（波形渲染、数据加载）
20. 跨浏览器兼容性测试
21. 用户体验优化

**第六阶段: P2功能开发** (3-4天)
22. 缺陷记录功能（US4）
23. 参数配置功能（US5）
24. 文件管理功能（US6）

**第七阶段: P3功能开发** (3-4天)
25. 报告生成功能（US7）
26. 权限管理功能（US8）
27. 数据导出功能（US9）

**第八阶段: 最终测试和部署** (1-2天)
28. 完整功能测试
29. 性能和安全测试
30. Netlify生产环境部署
31. 文档完善

**总预计开发时间**: 14-18天

---

## Key Technical Decisions

### 1. 为什么选择纯HTML/CSS/JS而非框架？

**决策**: 不使用React/Vue/Angular等现代框架

**理由**:
- ✅ **简单性**: 无需学习框架、无需构建工具、无需配置
- ✅ **AI友好**: 原生代码更容易被AI编程工具理解和修改
- ✅ **性能**: 无框架开销，页面加载更快
- ✅ **维护**: 代码量少，易于维护和调试
- ✅ **兼容性**: 直接运行在所有现代浏览器，无兼容性问题

**权衡**: 失去了框架的组件化和响应式状态管理，但项目规模不大，原生JS完全可以胜任

### 2. 为什么选择ECharts而非Chart.js？

**决策**: 使用ECharts作为图表库

**理由**:
- ✅ **工业级性能**: ECharts专为大数据量设计，支持Canvas/SVG/WebGL渲染
- ✅ **丰富的图表类型**: 提供折线图、散点图、热力图等多种工业可视化图表
- ✅ **流式渲染**: 支持数据流式更新，适合实时波形显示
- ✅ **交互能力**: 强大的缩放、平移、数据标注功能
- ✅ **中文文档**: 完善的中文文档和社区支持

**权衡**: ECharts文件体积较大（约900KB），但可以通过CDN加载和浏览器缓存缓解

### 3. 如何解决Web应用无法直接采集硬件信号的问题？

**决策**: 同时支持模拟数据生成和文件导入

**方案A - 模拟信号生成器** (MVP实现):
```javascript
// 生成符合真实特征的波形数据
function generateSignalData(duration, sampleRate) {
  const data = [];
  for (let t = 0; t < duration * sampleRate; t++) {
    const time = t / sampleRate;
    // 基础正弦波 + 噪声 + 随机缺陷
    const signal = 50 * Math.sin(2 * Math.PI * 5 * time) + 
                   randomNoise() + 
                   (Math.random() > 0.98 ? defectSignal() : 0);
    data.push({
      timestamp: time,
      amplitude: signal,
      frequency: 5,
      phase: 0
    });
  }
  return data;
}
```

**方案B - CSV文件导入** (V1.1实现):
```javascript
// 支持导入外部采集的数据文件
async function importSignalData(file) {
  const text = await file.text();
  const rows = text.split('\n');
  const data = rows.map(row => {
    const [time, amplitude, frequency] = row.split(',');
    return { timestamp: +time, amplitude: +amplitude, frequency: +frequency };
  });
  return data;
}
```

**理由**: 模拟数据可用于演示和培训，文件导入可用于分析真实采集的数据，两者结合满足不同场景需求

### 4. 如何确保数据安全？

**决策**: 完全依赖Supabase的安全机制

**安全层次**:
1. **传输安全**: 所有API调用通过HTTPS加密
2. **认证**: Supabase Auth提供邮箱密码登录
3. **授权**: RLS（Row Level Security）行级安全策略
4. **数据加密**: Supabase自动加密存储数据

**RLS策略示例**:
```sql
-- 用户只能查看自己创建的实验
CREATE POLICY "Users can view own experiments" 
ON experiments FOR SELECT 
USING (operator_id = auth.uid());

-- 管理员可以查看所有实验
CREATE POLICY "Admins can view all experiments"
ON experiments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 5. 如何优化波形渲染性能？

**决策**: 使用多级优化策略

**性能优化措施**:

1. **Canvas硬件加速**: ECharts使用Canvas 2D API，启用GPU加速
2. **数据抽样**: 屏幕宽度有限，超过可见数据点时自动抽样
   ```javascript
   const maxVisiblePoints = canvasWidth; // 如1920像素
   if (dataPoints.length > maxVisiblePoints) {
     // 抽样算法：保留峰值和谷值
     data = downSampleData(dataPoints, maxVisiblePoints);
   }
   ```
3. **节流渲染**: 使用requestAnimationFrame控制渲染频率
   ```javascript
   let animationFrameId;
   function updateChart(newData) {
     if (animationFrameId) return; // 防止重复渲染
     animationFrameId = requestAnimationFrame(() => {
       chart.setOption({ series: { data: newData } });
       animationFrameId = null;
     });
   }
   ```
4. **增量更新**: 只更新变化的数据点，不重绘整个图表
5. **Web Worker**: 将信号处理（滤波、缺陷检测）移到后台线程

**预期性能**: 60fps刷新率，10000个数据点无卡顿

---

## Risk Mitigation

### 风险1: Supabase服务不可用

**影响**: 系统无法访问数据，功能完全不可用

**缓解措施**:
- 实现LocalStorage临时缓存，短时间离线可继续查看数据
- 显示友好的错误提示和重连机制
- 后续版本实现完整的Service Worker离线模式

### 风险2: 波形渲染性能不达标

**影响**: 用户体验差，无法流畅监控信号

**缓解措施**:
- 提前进行性能测试和基准测试
- 使用Chrome DevTools的Performance工具分析瓶颈
- 如ECharts无法满足，考虑使用WebGL渲染（如Three.js）

### 风险3: 浏览器兼容性问题

**影响**: 部分用户无法使用系统

**缓解措施**:
- 明确要求Chrome 90+等现代浏览器
- 添加浏览器检测，对旧浏览器显示升级提示
- 使用Polyfill确保关键API兼容

### 风险4: 数据量过大导致浏览器内存溢出

**影响**: 长时间运行后浏览器崩溃

**缓解措施**:
- 限制内存中缓存的数据量（如最多100MB）
- 超出部分自动保存到Supabase，需要时重新加载
- 定期清理不需要的历史数据

---

## Success Metrics Tracking

### 性能指标

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 页面加载时间 | < 3秒 | Chrome DevTools Network面板 |
| 波形渲染帧率 | ≥ 30fps | Chrome DevTools Performance面板 |
| 数据保存响应 | < 2秒 | 手动计时测试 |
| 搜索查询响应 | < 1秒 | 手动计时测试 |

### 功能指标

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 功能按钮数量 | 9个（左6+右3） | 界面检查 |
| ISO标准字段 | 25+个必填字段 | 数据模型检查 |
| 缺陷类型数量 | 7种 | 配置检查 |

### 用户体验指标

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 首次使用时间 | < 5分钟 | 用户观察测试 |
| 功能发现率 | > 95% | 用户反馈 |
| 满意度评分 | > 4.5/5 | 问卷调查 |

---

## Deployment Strategy

### Netlify部署配置

**部署方式**: Git自动部署 + 手动部署备选

**Netlify配置** (netlify.toml):
```toml
[build]
  publish = "."
  command = "echo 'No build required - static site'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

**环境变量配置**:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

**部署流程**:
1. 代码推送到Git仓库main分支
2. Netlify自动触发构建和部署
3. 生产环境URL自动更新
4. 验证部署成功（访问URL，测试核心功能）

**回滚策略**:
- Netlify保留所有历史部署版本
- 出现问题可一键回滚到上一个稳定版本

---

## Next Steps

1. ✅ **Phase 0完成**: 创建research.md记录技术研究和决策
2. ✅ **Phase 1完成**: 创建data-model.md和quickstart.md
3. ⏭️ **Phase 2**: 使用 `/speckit.tasks` 命令生成开发任务列表
4. ⏭️ **开始开发**: 按照tasks.md中的任务顺序开始编码实现

---

**计划创建人**: AI开发助手  
**创建时间**: 2025-10-07  
**文档版本**: v1.0