# 接触式磁检测仪器软件 - Web版

<div align="center">

![Project Status](https://img.shields.io/badge/status-in_development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**高端工业级磁检测仪器控制软件 - Web版本**

符合 ISO 9934-1:2016 国际标准 | 实时信号采集 | 专业数据分析

[查看演示](#) | [快速开始](#快速开始) | [文档](#文档)

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [数据库设计](#数据库设计)
- [API文档](#api文档)
- [部署指南](#部署指南)
- [测试](#测试)
- [任务清单](#任务清单)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🎯 项目简介

**磁检测仪器软件Web版**是一款完全基于Web技术开发的工业级磁检测仪器控制软件。该项目完整复现了DOPPLER品牌磁检测仪器的专业界面和核心功能，提供符合国际标准的磁粉检测、磁漏检测解决方案。

### 项目目标

- 🎨 **原汁原味**：100%复现DOPPLER仪器的工业化界面设计
- 📊 **专业标准**：严格遵循ISO 9934-1:2016等国际标准
- ⚡ **实时性能**：实时信号采集与波形显示（60fps流畅渲染）
- 💾 **云端协同**：基于Supabase的云端数据存储和同步
- 📱 **现代化**：响应式设计，支持多设备访问
- 🔒 **安全可靠**：企业级数据安全和权限管理

### 应用场景

- 钢结构件无损检测
- 石油管道缺陷检测
- 航空航天部件质量检验
- 铁路车辆安全检测
- 压力容器检测

---

## ✨ 功能特性

### 核心功能

#### 🖥️ 工业级界面
- 完整复现DOPPLER仪器外观（橙色+黑色工业配色）
- 仿真硬件按钮操作（左侧6个功能键 + 右侧3个控制键）
- 金属质感和LED指示灯效果
- 全屏沉浸式操作体验

#### 📈 实时信号采集与显示
- 双通道磁信号实时波形显示（A-scan）
- 信号增益调节：1x ~ 20x
- 波形交互：缩放、平移、标记
- 缺陷自动识别与定位
- 60fps流畅渲染

#### 🧪 标准化实验管理
- 符合ISO 9934-1:2016标准的实验流程
- 完整的实验信息记录：
  - 工件信息（名称、材料、规格、批次）
  - 检测参数（磁化方式、电流、频率）
  - 操作人员信息和资质
- 实验数据云端存储
- 历史实验查询和管理

#### 📁 文件管理系统
- 树形结构文件浏览
- 文件分类管理（实验数据/报告/图像/设置）
- 云端同步（Supabase Storage）
- 文件搜索和过滤
- 批量操作支持

#### ⚙️ 精确参数配置
- **磁化参数**：电流(0-2000mA)、频率(50/60Hz/DC)、时间(0.5-10s)
- **门控参数**：位置、宽度、阈值
- **增益参数**：信号增益(0-100dB)、噪声抑制、滤波器
- **显示参数**：波形颜色、网格、坐标轴
- 参数预设保存与加载

#### 📊 数据分析与报告
- 缺陷自动识别算法
- 缺陷分类（裂纹/气孔/夹杂等）
- 严重程度评估
- 统计分析图表
- PDF检测报告生成
- Excel数据导出

#### 🔐 用户权限管理
- 角色权限控制（管理员/操作员/查看者）
- 操作日志审计
- 数据安全保护

---

## 🏗️ 技术架构

### 技术栈

```
前端技术栈：
├── HTML5          # 结构层
├── CSS3           # 样式层（工业风格）
├── JavaScript     # ES6+ 原生JS
└── ECharts 5.x    # 图表库

后端服务：
└── Supabase (BaaS)
    ├── PostgreSQL    # 数据库
    ├── Realtime      # 实时订阅
    ├── Storage       # 文件存储
    └── Auth          # 用户认证

部署平台：
└── Netlify
    ├── 静态托管
    ├── CDN加速
    └── HTTPS支持
```

### 架构设计原则

1. **简单至上**：使用原生HTML/CSS/JS，无需复杂框架和构建工具
2. **AI友好**：清晰的代码结构，便于AI编程工具理解和开发
3. **模块化**：功能模块独立，易于维护和扩展
4. **无后端**：所有后端逻辑通过Supabase实现
5. **响应式**：适配各种屏幕尺寸
6. **高性能**：优化渲染性能，确保流畅体验

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          浏览器端                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  界面层      │  │  业务逻辑层  │  │  数据层       │          │
│  │              │  │              │  │              │          │
│  │ - 主界面     │  │ - 信号处理   │  │ - LocalStorage│         │
│  │ - 波形图     │  │ - 数据管理   │  │ - IndexedDB  │          │
│  │ - 文件管理   │  │ - 文件操作   │  │ - Supabase   │          │
│  │ - 参数配置   │  │ - 报告生成   │  │   Client     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Cloud                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │  Realtime    │  │   Storage    │          │
│  │  Database    │  │  Subscript   │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │     Auth     │  │     RLS      │                            │
│  │   Service    │  │   Security   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 环境要求

- 现代浏览器（Chrome 90+, Edge 90+, Firefox 88+）
- 互联网连接（用于Supabase服务）
- 屏幕分辨率：1920x1080 或更高

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/maguiweb.git
cd maguiweb
```

2. **配置环境变量**

创建 `.env` 文件并填入Supabase配置：

```env
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g
```

3. **初始化数据库**

运行 Supabase 数据库迁移脚本（见[数据库设计](#数据库设计)章节）

4. **启动开发服务器**

由于是纯静态网站，可以使用任何Web服务器：

```bash
# 使用Python内置服务器
python -m http.server 8080

# 或使用Node.js的http-server
npx http-server -p 8080

# 或直接用浏览器打开 index.html
```

5. **访问应用**

打开浏览器访问：`http://localhost:8080`

---

## 📁 项目结构

```
maguiweb/
├── index.html                    # 应用入口文件
│
├── css/                          # 样式文件目录
│   ├── main.css                 # 主样式文件
│   ├── industrial.css           # 工业风格样式
│   ├── responsive.css           # 响应式样式
│   └── animations.css           # 动画效果
│
├── js/                           # JavaScript文件目录
│   ├── app.js                   # 应用主逻辑
│   ├── config.js                # 配置文件
│   ├── supabase-client.js       # Supabase客户端
│   ├── signal-chart.js          # 磁信号图表模块
│   ├── data-manager.js          # 数据管理模块
│   ├── file-system.js           # 文件管理模块
│   ├── parameter-config.js      # 参数配置模块
│   ├── report-generator.js      # 报告生成模块
│   ├── auth.js                  # 用户认证模块
│   └── utils.js                 # 工具函数
│
├── assets/                       # 静态资源目录
│   ├── images/                  # 图片资源
│   │   ├── icons/              # 图标
│   │   ├── buttons/            # 按钮图片
│   │   └── logo/               # Logo
│   ├── fonts/                   # 字体文件
│   └── sounds/                  # 音效文件（按钮点击音等）
│
├── lib/                          # 第三方库目录
│   ├── echarts.min.js           # ECharts图表库
│   ├── jspdf.min.js             # PDF生成库
│   └── xlsx.min.js              # Excel导出库
│
├── docs/                         # 文档目录
│   ├── PRD.md                   # 产品需求文档
│   ├── README.md                # 项目说明文档
│   ├── API.md                   # API文档
│   ├── DATABASE.md              # 数据库文档
│   └── DEPLOYMENT.md            # 部署文档
│
├── tests/                        # 测试目录
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── e2e/                     # 端到端测试
│
├── database/                     # 数据库脚本目录
│   ├── migrations/              # 数据库迁移脚本
│   ├── seeds/                   # 种子数据
│   └── schema.sql               # 数据库架构
│
├── netlify.toml                 # Netlify配置文件
├── .env.example                 # 环境变量示例
├── .gitignore                   # Git忽略文件
├── package.json                 # 依赖管理（可选）
└── README.md                    # 本文件
```

---

## 💻 开发规范

### 代码风格

#### HTML规范
- 使用语义化标签
- 保持良好的标签嵌套层次
- 添加适当的注释说明功能模块
- 使用data-*属性存储自定义数据

```html
<!-- ✅ 推荐 -->
<div class="signal-chart" data-channel="1">
  <canvas id="chart-canvas"></canvas>
</div>

<!-- ❌ 不推荐 -->
<div class="div1">
  <canvas></canvas>
</div>
```

#### CSS规范
- 使用BEM命名规范：`block__element--modifier`
- 使用CSS变量定义主题色
- 避免使用!important
- 移动端优先的响应式设计

```css
/* ✅ 推荐 */
:root {
  --color-primary: #FF6B00;
  --color-dark: #2A2A2A;
}

.button--primary {
  background-color: var(--color-primary);
}

/* ❌ 不推荐 */
.btn {
  background-color: #FF6B00 !important;
}
```

#### JavaScript规范
- 使用ES6+语法
- 使用const/let，避免var
- 函数采用驼峰命名：camelCase
- 类采用帕斯卡命名：PascalCase
- 常量使用大写：SNAKE_CASE
- 添加JSDoc注释

```javascript
// ✅ 推荐
/**
 * 初始化磁信号图表
 * @param {string} containerId - 容器ID
 * @param {Object} options - 配置选项
 * @returns {Object} ECharts实例
 */
const initSignalChart = (containerId, options) => {
  // 实现代码
};

// ❌ 不推荐
function init(id) {
  var chart = echarts.init(document.getElementById(id));
  return chart;
}
```

### 注释规范

1. **必须添加注释的情况**：
   - 所有函数/方法的功能说明
   - 复杂算法的实现逻辑
   - 关键业务逻辑的解释
   - 数据结构的定义
   - API调用的说明

2. **注释格式**：
   - 使用JSDoc格式
   - 中文注释，简洁明了
   - 包含参数类型和返回值

```javascript
/**
 * 保存实验数据到Supabase
 * @param {Object} experimentData - 实验数据对象
 * @param {string} experimentData.projectName - 项目名称
 * @param {string} experimentData.workpieceName - 工件名称
 * @param {number} experimentData.magnetizationCurrent - 磁化电流(mA)
 * @returns {Promise<Object>} 返回保存结果
 * @throws {Error} 当数据验证失败时抛出错误
 */
async function saveExperimentData(experimentData) {
  // 数据验证
  if (!experimentData.projectName) {
    throw new Error('项目名称不能为空');
  }
  
  // 保存到Supabase
  const { data, error } = await supabase
    .from('experiments')
    .insert(experimentData);
    
  if (error) throw error;
  return data;
}
```

### 版本控制

#### Git提交规范

使用语义化提交信息（Conventional Commits）：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**：
```bash
feat(signal-chart): 添加双通道波形显示功能

- 实现通道1和通道2的同时显示
- 添加通道切换按钮
- 优化波形渲染性能

Closes #123
```

### 文件命名规范

- HTML文件：`kebab-case.html`
- CSS文件：`kebab-case.css`
- JS文件：`kebab-case.js`
- 图片文件：`kebab-case.png/jpg/svg`

---

## 🗄️ 数据库设计

### Supabase数据库表结构

详细的数据库设计请查看 [PRD文档 - 第4章数据库设计](./docs/PRD.md#4-数据库设计)

核心数据表：

1. **experiments** - 实验项目表
2. **signal_data** - 磁信号数据表
3. **defects** - 缺陷记录表
4. **configurations** - 参数配置表
5. **users** - 用户表
6. **system_logs** - 系统日志表

### 数据库初始化脚本

查看 `database/schema.sql` 文件

---

## 📡 API文档

### Supabase API调用

#### 1. 创建实验
```javascript
const { data, error } = await supabase
  .from('experiments')
  .insert({
    project_name: '钢板焊缝检测-2025-10-07',
    workpiece_name: 'Q345钢板',
    workpiece_material: 'Q345',
    operator_name: '张工',
    magnetization_method: '直流磁化',
    test_result: '检测中'
  });
```

#### 2. 查询实验列表
```javascript
const { data, error } = await supabase
  .from('experiments')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

#### 3. 保存信号数据（批量）
```javascript
const { data, error } = await supabase
  .from('signal_data')
  .insert(signalDataArray);
```

#### 4. 实时订阅
```javascript
const subscription = supabase
  .channel('experiments')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'experiments' },
    (payload) => {
      console.log('数据变化:', payload);
    }
  )
  .subscribe();
```

更多API文档请查看 `docs/API.md`

---

## 🚢 部署指南

### Netlify部署

1. **准备工作**
   - 确保所有代码已提交到Git仓库
   - 在Netlify上创建新站点

2. **配置netlify.toml**

```toml
[build]
  publish = "."
  command = "echo 'No build required'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
```

3. **环境变量配置**

在Netlify后台设置环境变量：
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

4. **部署命令**

```bash
# 方式1：Git自动部署
git push origin main

# 方式2：手动部署
pnpm run build  # 如果需要构建
netlify deploy --prod
```

详细部署文档请查看 `docs/DEPLOYMENT.md`

---

## 🧪 测试

### 测试策略

1. **单元测试**：测试独立功能模块
2. **集成测试**：测试模块间交互
3. **端到端测试**：测试完整业务流程
4. **性能测试**：测试加载和渲染性能
5. **兼容性测试**：测试多浏览器兼容性

### 测试用例编写规范

```javascript
/**
 * 测试用例：保存实验数据
 */
describe('数据管理模块', () => {
  test('应该成功保存实验数据', async () => {
    const testData = {
      project_name: '测试项目',
      workpiece_name: '测试工件'
    };
    
    const result = await saveExperimentData(testData);
    expect(result).toBeDefined();
    expect(result.id).toBeTruthy();
  });
  
  test('应该在必填字段缺失时抛出错误', async () => {
    const invalidData = {};
    await expect(saveExperimentData(invalidData)).rejects.toThrow();
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- signal-chart.test.js

# 生成测试覆盖率报告
npm test -- --coverage
```

---

## 📝 任务清单

### ✅ 已完成

- [x] PRD文档编制（2025-10-07）
- [x] README文档编制（2025-10-07）

### 🔄 进行中

- [ ] Supabase数据库设计和初始化

### 📋 待开发

#### 第一阶段：基础框架
- [ ] 项目文件结构创建
- [ ] 环境配置文件
- [ ] Supabase客户端集成
- [ ] 基础CSS工业风格样式

#### 第二阶段：核心功能
- [ ] 仪器主界面HTML结构
- [ ] 左侧功能按钮区域
- [ ] 右侧控制按钮区域
- [ ] 顶部数据表格区域
- [ ] 主显示屏区域
- [ ] 磁信号实时波形图表
- [ ] 实验数据管理模块
- [ ] 参数配置界面

#### 第三阶段：扩展功能
- [ ] 文件管理系统
- [ ] 缺陷识别算法
- [ ] 数据分析功能
- [ ] PDF报告生成
- [ ] Excel数据导出
- [ ] 用户认证功能

#### 第四阶段：测试优化
- [ ] 编写测试用例
- [ ] 功能测试
- [ ] 性能优化
- [ ] 浏览器兼容性测试
- [ ] 用户体验优化

#### 第五阶段：部署上线
- [ ] Netlify部署配置
- [ ] 生产环境测试
- [ ] 文档完善
- [ ] 用户手册编写

---

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 代码审查标准

- 代码符合规范
- 添加必要的注释
- 通过所有测试
- 更新相关文档

---

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件

---

## 👥 开发团队

- **项目负责人**：AI Full-Stack Developer
- **技术栈**：HTML/CSS/JavaScript + Supabase + Netlify
- **开发工具**：Cursor AI编程助手

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/maguiweb/issues)
- 发送邮件至：[your-email@example.com]

---

## 🙏 致谢

感谢以下开源项目和服务：

- [Supabase](https://supabase.com/) - 开源的Firebase替代方案
- [ECharts](https://echarts.apache.org/) - 强大的图表库
- [Netlify](https://www.netlify.com/) - 优秀的部署平台
- [Cursor](https://cursor.sh/) - AI编程助手

---

## 📚 相关文档

- [产品需求文档 (PRD)](./docs/PRD.md)
- [API文档](./docs/API.md)
- [数据库文档](./docs/DATABASE.md)
- [部署文档](./docs/DEPLOYMENT.md)

---

<div align="center">

**Made with ❤️ by AI Full-Stack Developer**

⭐ 如果这个项目对您有帮助，请给我们一个星标！

</div>
