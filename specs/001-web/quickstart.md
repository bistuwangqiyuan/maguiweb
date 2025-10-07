# Quick Start Guide: 磁检测仪器Web界面系统

**Feature**: 001-web | **Date**: 2025-10-07 | **For**: 开发者和测试人员

---

## 🚀 5分钟快速启动

### 前置要求

- ✅ 现代浏览器（Chrome 90+, Edge 90+, Firefox 88+）
- ✅ 互联网连接（访问Supabase服务和CDN）
- ✅ 可选：Node.js和http-server（用于本地开发）

### 快速启动步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/maguiweb.git
cd maguiweb

# 2. 配置环境变量（Supabase连接信息已预配置）
# 无需额外配置，.env文件已存在

# 3. 启动本地服务器（方式1：使用http-server）
npx http-server -p 8080 -o

# 方式2：使用Python
python -m http.server 8080

# 方式3：直接用浏览器打开
# 双击 index.html 文件
```

**访问应用**: 打开浏览器访问 `http://localhost:8080`

---

## 📂 项目结构概览

```
maguiweb/
├── index.html              # 主应用入口 ⭐
├── css/                    # 样式文件
│   ├── main.css           # 主样式
│   └── industrial.css     # 工业风格
├── js/                     # JavaScript模块
│   ├── config.js          # 配置（Supabase连接）
│   ├── app.js             # 应用主逻辑
│   ├── supabase-client.js # 数据库客户端
│   └── signal-chart.js    # 波形图表
├── assets/                 # 静态资源
│   └── images/            # 图片资源
└── database/               # 数据库脚本
    └── schema.sql         # 数据库架构
```

---

## 🎯 核心功能演示

### 功能1: 实时磁信号波形显示

```javascript
// 在浏览器开发工具Console中测试波形生成
const mockData = Utils.generateMockSignalData(100, 50);
console.log('模拟信号数据:', mockData);

// 查看波形图表实例
console.log('图表实例:', window.signalChart);
```

**预期结果**: 主显示区域显示流畅的绿色波形图，实时更新

### 功能2: 创建实验项目

```javascript
// 在Console中测试实验创建
const testExperiment = {
  project_name: '测试实验-' + new Date().toISOString(),
  workpiece_name: '测试工件',
  operator_name: '测试人员',
  magnetization_method: '直流磁化',
  magnetization_current: 1000
};

supabaseClient.createExperiment(testExperiment)
  .then(data => console.log('实验创建成功:', data))
  .catch(error => console.error('创建失败:', error));
```

**预期结果**: 实验数据保存到Supabase，返回包含ID的实验对象

### 功能3: 查询实验列表

```javascript
// 查询最近10个实验
supabaseClient.getExperiments({ limit: 10 })
  .then(data => console.log('实验列表:', data))
  .catch(error => console.error('查询失败:', error));
```

**预期结果**: 返回实验数组，按创建时间倒序排列

---

## 🛠️ 开发工具和调试

### Chrome DevTools使用

1. **Console面板**: 测试JavaScript函数和API调用
2. **Network面板**: 查看Supabase API请求和响应
3. **Performance面板**: 分析波形渲染性能（目标≥30fps）
4. **Application面板**: 查看LocalStorage缓存数据

### 常用开发命令

```bash
# 查看项目文件大小
du -sh ./*

# 查看JavaScript代码行数
find js -name "*.js" | xargs wc -l

# 启动开发服务器并监听文件变化（需要live-server）
npx live-server --port=8080 --no-browser
```

---

## 📊 Supabase数据库访问

### 使用Supabase Web界面

1. 访问: https://app.supabase.com
2. 登录账号
3. 选择项目: `maguiweb` 
4. 点击"Table Editor"查看数据表
5. 点击"SQL Editor"执行SQL查询

### 常用SQL查询

```sql
-- 查看所有实验
SELECT * FROM experiments ORDER BY created_at DESC LIMIT 10;

-- 查看实验统计
SELECT 
  test_result,
  COUNT(*) as count,
  AVG(defect_count) as avg_defects
FROM experiments 
GROUP BY test_result;

-- 查看最活跃用户
SELECT 
  operator_name,
  COUNT(*) as experiment_count
FROM experiments
GROUP BY operator_name
ORDER BY experiment_count DESC;
```

### 重置数据库（谨慎！）

```sql
-- 清空所有实验数据（保留表结构）
TRUNCATE TABLE signal_data CASCADE;
TRUNCATE TABLE defects CASCADE;
TRUNCATE TABLE files CASCADE;
TRUNCATE TABLE experiments CASCADE;
TRUNCATE TABLE system_logs CASCADE;
```

---

## 🧪 测试指南

### 手动功能测试清单

#### ✅ 基础功能测试

- [ ] 页面加载正常，无JavaScript错误
- [ ] 工业化界面正确显示（橙色边框、黑色背景）
- [ ] 左侧6个功能按钮可见且可点击
- [ ] 右侧3个控制按钮可见且可点击
- [ ] 按钮悬停有高亮效果
- [ ] 按钮点击有下压效果

#### ✅ 波形显示测试

- [ ] 主显示区域显示波形图
- [ ] 波形实时更新（无卡顿）
- [ ] 双通道信号同时显示
- [ ] 波形可以用鼠标滚轮缩放
- [ ] 波形可以拖拽平移
- [ ] 顶部数据表格显示关键参数

#### ✅ 实验管理测试

- [ ] 点击"新建实验"按钮打开表单
- [ ] 填写必填字段后可以保存
- [ ] 缺少必填字段时显示错误提示
- [ ] 实验列表正确显示
- [ ] 搜索功能正常工作
- [ ] 加载历史实验可以恢复数据

#### ✅ 性能测试

- [ ] 页面加载时间 < 3秒（使用Network面板测量）
- [ ] 波形渲染帧率 ≥ 30fps（使用Performance面板测量）
- [ ] 数据保存响应时间 < 2秒
- [ ] 搜索查询响应时间 < 1秒

### 自动化测试（可选）

```javascript
// 批量创建测试实验
async function createTestExperiments(count) {
  for (let i = 0; i < count; i++) {
    await supabaseClient.createExperiment({
      project_name: `批量测试实验-${i+1}`,
      workpiece_name: `测试工件-${i+1}`,
      operator_name: '自动化测试',
      magnetization_method: '直流磁化',
      magnetization_current: 1000 + i * 10
    });
  }
  console.log(`✅ 创建了${count}个测试实验`);
}

// 执行
createTestExperiments(50);
```

---

## 🐛 常见问题排查

### 问题1: 页面打开后白屏，无任何显示

**排查步骤**:
1. 打开Chrome DevTools Console查看是否有错误
2. 检查Network面板，确认CDN资源（ECharts、Supabase）加载成功
3. 检查`.env`文件是否存在且包含正确的Supabase配置

**解决方案**:
```bash
# 确认.env文件存在
ls -la .env

# 检查Supabase连接
curl https://zzyueuweeoakopuuwfau.supabase.co/rest/v1/
```

### 问题2: 波形不显示或不更新

**排查步骤**:
1. Console中检查`window.signalChart`是否存在
2. 检查是否有JavaScript错误
3. 验证ECharts库是否加载成功

**解决方案**:
```javascript
// 在Console中手动初始化图表
if (!window.signalChart) {
  window.signalChart = echarts.init(document.getElementById('signal-chart'));
  console.log('✅ 图表初始化成功');
}
```

### 问题3: Supabase连接失败

**错误信息**: `Failed to fetch` 或 `Network Error`

**排查步骤**:
1. 检查网络连接
2. 验证Supabase URL和API Key是否正确
3. 检查Supabase项目是否已暂停

**解决方案**:
```javascript
// 测试Supabase连接
fetch('https://zzyueuweeoakopuuwfau.supabase.co/rest/v1/', {
  headers: {
    'apikey': CONFIG.SUPABASE_ANON_KEY
  }
})
.then(res => console.log('✅ Supabase连接正常:', res.status))
.catch(err => console.error('❌ Supabase连接失败:', err));
```

### 问题4: 数据保存失败

**错误信息**: `Row Level Security policy violation`

**原因**: Supabase RLS策略阻止了数据操作

**解决方案**:
1. 确保用户已登录（`supabaseClient.getCurrentUser()`）
2. 检查RLS策略是否正确配置
3. 临时方案：在Supabase后台禁用RLS（仅用于开发测试）

---

## 📚 推荐学习资源

### ECharts文档
- 官方文档: https://echarts.apache.org/zh/index.html
- 示例库: https://echarts.apache.org/examples/zh/index.html
- 配置项手册: https://echarts.apache.org/zh/option.html

### Supabase文档
- 官方文档: https://supabase.com/docs
- JavaScript Client: https://supabase.com/docs/reference/javascript/
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

### 磁检测标准
- ISO 9934-1:2016 - 磁粉检测标准
- ASTM E1444 - 磁粉检测标准实践

---

## 🚢 部署到Netlify

### 准备部署

```bash
# 1. 确保代码已提交到Git
git add .
git commit -m "feat: 完成磁检测仪器Web界面MVP"
git push origin main

# 2. 登录Netlify（首次）
npx netlify login

# 3. 初始化Netlify站点
npx netlify init

# 4. 部署到生产环境
npx netlify deploy --prod
```

### 环境变量配置

在Netlify后台配置以下环境变量：
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

### 验证部署

部署成功后，访问Netlify提供的URL（如 https://your-site.netlify.app），测试以下功能：
- [ ] 页面正常加载
- [ ] Supabase连接正常
- [ ] 波形图显示正常
- [ ] 可以创建和查询实验

---

## 📞 获取帮助

遇到问题？查看以下资源：

1. **项目文档**: 查看`docs/`目录下的详细文档
2. **技术设计**: 查看`specs/001-web/plan.md`
3. **数据模型**: 查看`specs/001-web/data-model.md`
4. **浏览器Console**: 查看详细的错误日志

---

## 🎉 恭喜！

您已经成功启动了磁检测仪器Web界面系统！

**下一步建议**:
1. ✅ 熟悉界面操作（点击各个按钮，体验交互）
2. ✅ 创建第一个实验项目
3. ✅ 查看波形图并尝试缩放平移
4. ✅ 阅读详细文档了解更多功能

**开始开发**:
- 查看`specs/001-web/tasks.md`了解开发任务列表
- 按优先级顺序实现功能
- 每完成一个功能后进行测试

---

**文档创建人**: AI开发助手  
**创建时间**: 2025-10-07  
**文档版本**: v1.0
