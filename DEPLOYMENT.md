# 部署指南 - DOPPLER 磁检测仪器系统

## 项目信息

- **项目名称**: DOPPLER 磁检测仪器Web控制系统
- **技术栈**: HTML + CSS + JavaScript + Supabase + Netlify
- **标准**: ISO 9934-1:2016
- **版本**: v1.0.0

---

## 前置条件

### 1. Supabase 账号和项目
- 访问 https://app.supabase.com
- 已创建项目
- 已配置数据库（参考 `database/INIT_DATABASE.md`）

### 2. Netlify 账号
- 访问 https://www.netlify.com
- 已注册账号

### 3. 本地环境
- Node.js 16+ (可选，用于本地测试)
- Git (用于代码管理)

---

## 部署步骤

### Step 1: 准备环境变量

在项目根目录创建 `.env` 文件（生产环境不需要）：

```bash
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**: 这些值已经硬编码在 `js/config.js` 中，生产环境不需要额外配置。

### Step 2: 初始化 Supabase 数据库

1. 登录 Supabase 控制台
2. 打开 SQL Editor
3. 复制 `database/schema.sql` 的内容
4. 执行SQL脚本
5. 验证所有表已创建

详细步骤参考：`database/INIT_DATABASE.md`

### Step 3: 本地测试（可选）

```bash
# 安装依赖（如果使用了npm）
npm install

# 启动本地服务器
npm start

# 或使用Python
python -m http.server 8000

# 或使用VS Code Live Server插件
```

访问 http://localhost:8000 测试功能。

### Step 4: 部署到 Netlify

#### 方式 A: 通过 Netlify CLI（推荐）

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod

# 如果是首次部署，选择 "Create & configure a new site"
```

#### 方式 B: 通过 Git 连接（自动部署）

1. 将代码推送到 GitHub/GitLab/Bitbucket

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. 在 Netlify 控制台：
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的 Git 仓库
   - 配置构建设置：
     - Build command: (留空)
     - Publish directory: `.`
   - 点击 "Deploy site"

#### 方式 C: 手动上传

1. 在 Netlify 控制台点击 "Add new site" → "Deploy manually"
2. 将整个项目文件夹拖拽到上传区域
3. 等待部署完成

### Step 5: 配置自定义域名（可选）

1. 在 Netlify 项目设置中：
   - Site settings → Domain management
   - 点击 "Add custom domain"
   - 输入你的域名
   - 按照指示配置 DNS 记录

2. 启用 HTTPS（自动）：
   - Netlify 会自动为你的域名申请 Let's Encrypt SSL 证书

---

## 验证部署

### 1. 基本功能测试

访问你的网站：`https://your-site-name.netlify.app`

- [ ] 页面正常显示，外观符合工业风格
- [ ] DOPPLER Logo 和品牌标识显示正确
- [ ] 9个按钮（左6+右3）全部可见
- [ ] 按钮悬停和点击效果正常

### 2. 波形图测试

- [ ] 点击"查看波形"按钮
- [ ] 波形图容器正常显示
- [ ] 点击"播放/暂停"按钮
- [ ] 波形实时更新，帧率流畅

### 3. 实验管理测试

- [ ] 点击"开始检测" → "新建实验"
- [ ] 填写表单，保存实验
- [ ] 实验列表正确显示
- [ ] 搜索功能正常

### 4. 数据库连接测试

打开浏览器控制台(F12)，检查：

```javascript
// 应该看到以下日志
✓ 认证模块初始化完成
✓ 数据管理器初始化完成
✓ 缺陷管理器初始化完成
✓ 参数配置初始化完成
✓ 报告生成器初始化完成
✓ 波形图初始化完成
✓ DOPPLER 磁检测系统启动完成
```

如果看到 Supabase 连接错误，检查：
1. `js/config.js` 中的 URL 和 API Key 是否正确
2. Supabase 项目是否正常运行
3. 数据库表是否已创建

---

## 环境配置

### Netlify 环境变量（可选）

如果需要在 Netlify 中配置环境变量：

1. Site settings → Environment variables
2. 添加以下变量：
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

**注意**: 由于本项目是纯静态网站，环境变量实际上不会被注入。建议直接在 `js/config.js` 中硬编码。

### 安全头部

`netlify.toml` 已配置以下安全头部：
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 缓存策略

静态资源缓存已配置：
- CSS/JS: 1年缓存
- 图片: 1年缓存
- HTML: 不缓存

---

## 性能优化

### 1. CDN 加速

Netlify 自动使用全球 CDN，无需额外配置。

### 2. 图片优化

- 使用 WebP 格式
- 压缩图片大小
- 使用适当的尺寸

### 3. 代码优化

- CSS 和 JS 文件已模块化
- 使用 CDN 加载第三方库
- 按需加载模块

---

## 监控和维护

### 1. Netlify Analytics

在 Site settings → Analytics 中启用分析功能，可以查看：
- 访问量
- 页面加载时间
- 错误率

### 2. Supabase 监控

在 Supabase 控制台：
- Database → Logs: 查看数据库日志
- API → Logs: 查看 API 调用日志
- Storage → Logs: 查看文件操作日志

### 3. 错误日志

浏览器控制台会显示所有错误，生产环境建议集成错误追踪服务（如 Sentry）。

---

## 故障排查

### 问题1: 页面白屏

**原因**: JavaScript 加载失败或初始化错误

**解决**:
1. 打开浏览器控制台查看错误信息
2. 检查所有 JS 文件是否正确加载
3. 检查 Supabase 连接是否正常

### 问题2: Supabase 连接失败

**错误**: `Failed to fetch` 或 `Network error`

**解决**:
1. 检查 Supabase URL 是否正确
2. 检查 Supabase 项目是否暂停（免费版有限制）
3. 检查浏览器网络请求，确认 CORS 配置

### 问题3: 数据库操作失败

**错误**: `Row Level Security policy violation`

**解决**:
1. 检查 RLS 策略是否正确配置
2. 确认用户已登录（如果启用了认证）
3. 检查用户权限是否足够

### 问题4: 波形图不显示

**原因**: ECharts 未正确加载

**解决**:
1. 检查 CDN 是否可访问
2. 确认 `signal-chart.js` 已正确加载
3. 检查容器元素 ID 是否正确

---

## 回滚策略

### Netlify 部署回滚

1. 进入 Deploys 页面
2. 找到之前的成功部署版本
3. 点击 "Publish deploy"
4. 确认回滚

### 数据库回滚

Supabase 支持数据库快照：
1. Database → Backups
2. 选择备份时间点
3. 恢复数据

---

## 更新和升级

### 代码更新

```bash
# 拉取最新代码
git pull origin main

# 本地测试
npm start

# 部署更新
netlify deploy --prod
```

### 数据库迁移

当需要修改数据库结构时：

1. 创建新的迁移文件 `database/migrations/YYYYMMDD_description.sql`
2. 在 Supabase SQL Editor 中执行
3. 更新 `database/schema.sql` 文档

---

## 生产环境检查清单

部署到生产环境前，确认以下项目：

- [ ] 所有 Supabase 配置正确
- [ ] 数据库表已创建并配置 RLS
- [ ] 测试所有核心功能（波形、实验、缺陷）
- [ ] 检查浏览器兼容性（Chrome、Edge、Firefox）
- [ ] 移除所有调试日志和 console.log
- [ ] 配置自定义域名和 HTTPS
- [ ] 设置监控和错误追踪
- [ ] 准备用户文档

---

## 支持和联系

- **文档**: 参考 `README.md` 和 `specs/` 目录
- **问题**: 提交 GitHub Issues
- **紧急**: 联系系统管理员

---

**部署日期**: 2025-10-07  
**版本**: v1.0.0  
**状态**: ✅ 生产就绪
