# 创作者工具箱 (Creator Tools)

> 为创作者而生的高效工具集 - 免费、快速、无需注册

## 🎯 项目简介

创作者工具箱是一个专为自媒体人、内容创作者设计的在线工具集合，提供图片压缩、标题生成、封面下载等实用功能，帮助创作者提高工作效率。

### 核心特性

- 🚀 **即用即走** - 无需注册，打开即用
- 🔒 **隐私保护** - 数据本地处理，不上传服务器
- ⚡ **极致速度** - 优化性能，快速响应
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 简洁美观的用户界面

## 🛠️ 功能列表

### 📸 图片工具
- [x] **图片压缩器** - 批量压缩图片，减小文件大小
- [x] **图片格式转换器** - JPG/PNG/WebP格式互转
- [x] **截图工具** - 网页截图和编辑功能

### ✍️ 内容工具
- [x] **爆款标题生成器** - AI智能生成吸引人的标题（已集成后端API）
- [x] **字数统计器** - 实时统计字数、字符数、阅读时间
- [x] **内容提取工具** - 支持主流自媒体平台内容解析和下载
- [x] **Markdown编辑器** - 实时预览、语法高亮、多格式导出

### 🎵 媒体工具
- [x] **配音工具** - 支持系统语音和AI音色克隆的TTS工具
- [x] **封面下载器** - 一键下载YouTube视频封面（已集成后端API）
- [x] **社交媒体封面生成器** - 自定义尺寸的封面生成

### 🔧 实用工具
- [x] **二维码生成器** - 支持文本/URL/WiFi/联系人四种类型
- [x] **色彩工具箱** - 调色板生成、格式转换、对比度检查
- [x] **文本工具集** - 格式转换、编码解码、正则测试、哈希生成
- [x] **文档转换器** - 多种文档格式转换

### 🎵 配音工具特性

- **双模式支持**: 系统语音 + AI音色克隆
- **多语言支持**: 17+种语言，包括中文、英文、日文等
- **音色克隆**: 基于MiniMax API，10-60秒音频样本即可复刻音色
- **高质量输出**: MP3格式，支持语速、音调、音量调节
- **本地存储**: 克隆音色本地保存，支持重复使用

### 📱 内容提取工具特性

- **多平台支持**: YouTube、Bilibili、抖音、小红书、微信公众号、X(Twitter)、小宇宙、喜马拉雅
- **多内容类型**: 视频、音频、图片、文本内容
- **智能识别**: 自动检测平台类型和内容格式
- **质量选择**: 支持多种视频质量选项(1080p/720p/480p/仅音频)
- **一键下载**: 解析后直接下载到本地

## 🏗️ 技术架构

### 技术栈

- **前端**: Next.js 15.4.4 (App Router + Turbopack) + TypeScript 5 + React 19.1.0
- **样式**: Tailwind CSS 4
- **后端**: NestJS + TypeScript (已实现缩略图API和标题生成API)
- **AI服务**: OpenAI API (标题生成)
- **部署**: Vercel (前端) + Render/Railway (后端)
- **开发工具**: ESLint + Prettier

### 项目结构

```

creator-tools/
├── frontend/          # Next.js 前端项目
│   ├── src/
│   │   ├── app/      # App Router 页面
│   │   │   ├── tools/           # 14个工具页面
│   │   │   ├── layout.tsx       # 根布局
│   │   │   ├── page.tsx         # 首页
│   │   │   └── globals.css      # 全局样式
│   │   └── components/          # 可复用组件
│   ├── public/       # 静态资源
│   └── package.json  # 前端依赖配置
├── backend/          # NestJS 后端项目
│   ├── src/
│   │   ├── app.controller.ts    # 主控制器
│   │   ├── app.module.ts        # 主模块
│   │   ├── app.service.ts       # 主服务
│   │   └── main.ts             # 应用入口
│   ├── test/         # 测试文件
│   └── package.json  # 后端依赖配置
├── docs/             # 项目文档
│   └── archive/      # 归档文档
├── .env.example      # 环境变量模板
└── package.json      # Monorepo 配置




## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/creator-tools.git
cd creator-tools

# 安装根目录依赖
pnpm install

# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
pnpm install
```

### 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量，配置必要的API密钥
# 主要配置 MiniMax API（配音功能）
```

### 启动开发服务器

```bash
# 在项目根目录，同时启动前后端
pnpm dev

# 或者分别启动
cd frontend && pnpm dev    # 前端: http://localhost:3000
cd backend && pnpm start:dev  # 后端: http://localhost:3001
```

## 📝 开发规范

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint + Prettier 代码格式化规范
- 使用语义化的 Git 提交信息

### 命名规范

- **文件名**: kebab-case (如: `image-compressor.tsx`)
- **组件名**: PascalCase (如: `ImageCompressor`)
- **变量/函数**: camelCase (如: `handleFileUpload`)
- **API端点**: kebab-case (如: `/api/generate-headlines`)

### 提交规范

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
perf: 性能优化
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行前端测试
cd frontend && pnpm test

# 运行后端测试
cd backend && pnpm test

# 生成测试覆盖率报告
pnpm test:coverage
```

## 📦 构建部署

### 本地构建

```bash
# 构建前端项目
cd frontend && pnpm build

# 构建后端项目
cd backend && pnpm build
```

### 部署

#### 前端部署 (Vercel)

1. 连接 GitHub 仓库到 Vercel
2. 设置构建目录为 `frontend`
3. 配置环境变量
4. 自动部署

#### 后端部署 (Render/Railway)

1. 连接 GitHub 仓库
2. 设置构建目录为 `backend`
3. 配置环境变量
4. 设置启动命令: `pnpm start:prod`

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 问题反馈

- 🐛 [报告 Bug](https://github.com/your-username/creator-tools/issues/new?template=bug_report.md)
- 💡 [功能建议](https://github.com/your-username/creator-tools/issues/new?template=feature_request.md)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

## 📞 联系我们

- 项目主页: [https://creator-tools.vercel.app](https://creator-tools.vercel.app)
- 问题反馈: [GitHub Issues](https://github.com/your-username/creator-tools/issues)
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！