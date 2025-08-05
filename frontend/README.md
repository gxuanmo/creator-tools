# 创作者工具箱 - 前端应用

基于 Next.js 15 构建的现代化前端应用，为创作者提供高效的在线工具集合。集成后端API服务，提供智能化的内容创作辅助功能。

## 🚀 技术栈

- **框架**: Next.js 15.4.4 (App Router + Turbopack)
- **语言**: TypeScript 5
- **UI框架**: React 19.1.0
- **样式**: Tailwind CSS 4
- **构建工具**: Turbopack (开发) + Next.js (生产)
- **代码规范**: ESLint + Prettier

## 📦 核心依赖

### 功能库
- **图片处理**: browser-image-compression (图片压缩)
- **二维码生成**: qrcode + @types/qrcode
- **文件操作**: file-saver, jszip (文件下载和打包)
- **PDF生成**: jspdf (文档导出)
- **文件上传**: react-dropzone (拖拽上传)
- **API集成**: 与后端NestJS服务集成，支持AI标题生成和缩略图提取

## 📁 项目结构

frontend/
├── src/
│   ├── app/                    # App Router 页面
│   │   ├── tools/             # 工具页面目录
│   │   │   ├── image-compressor/     # 图片压缩器
│   │   │   ├── title-generator/      # 标题生成器
│   │   │   ├── thumbnail-downloader/ # 封面下载器
│   │   │   ├── word-counter/         # 字数统计器
│   │   │   ├── image-converter/      # 图片格式转换
│   │   │   ├── voice-generator/      # 配音工具
│   │   │   ├── content-extractor/    # 内容提取工具
│   │   │   ├── qr-generator/         # 二维码生成器
│   │   │   ├── color-tools/          # 色彩工具箱
│   │   │   ├── markdown-editor/      # Markdown编辑器
│   │   │   ├── text-tools/           # 文本工具集
│   │   │   ├── social-cover/         # 社交媒体封面
│   │   │   ├── document-converter/   # 文档转换器
│   │   │   └── screenshot-tool/      # 截图工具
│   │   ├── layout.tsx         # 根布局组件
│   │   ├── page.tsx          # 首页
│   │   ├── globals.css       # 全局样式
│   │   └── sitemap.xml       # 站点地图
│   └── components/           # 可复用组件
├── public/                   # 静态资源
│   ├── favicon.svg          # 网站图标
│   └── *.svg               # 其他图标资源
├── package.json              # 项目依赖配置
├── next.config.js           # Next.js 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目说明文档

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖
```bash
# 安装项目依赖
pnpm install

# 或使用 npm
npm install
```

### 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置后端API地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 启动开发服务器
```bash
# 启动开发服务器
pnpm dev

# 或使用 npm
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔗 API 集成

### 后端服务依赖
前端应用依赖后端NestJS服务提供以下功能：
- **标题生成**: `/api/headlines/generate` - AI智能标题生成
- **缩略图提取**: `/api/thumbnail` - YouTube视频缩略图获取

### API 调用示例
```typescript
// 标题生成API调用
const generateHeadlines = async (data: {
  topic: string;
  keywords?: string;
  platform?: string;
  tone?: string;
  count?: number;
}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/headlines/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// 缩略图提取API调用
const getThumbnail = async (videoUrl: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/thumbnail?url=${encodeURIComponent(videoUrl)}`);
  return response.json();
};
```

## 📦 构建部署

### 本地构建
```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 设置构建目录为 `frontend`
3. 配置环境变量 `NEXT_PUBLIC_API_BASE_URL`
4. 自动部署

## 🔧 开发规范

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint + Prettier 代码格式化规范
- 使用语义化的组件和函数命名

### 文件命名规范
- **页面文件**: kebab-case (如: `image-compressor/page.tsx`)
- **组件文件**: PascalCase (如: `ImageCompressor.tsx`)
- **工具函数**: camelCase (如: `handleFileUpload.ts`)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](../LICENSE)。

## 🔗 相关链接

- [后端项目](../backend/README.md)
- [项目根目录](../README.md)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)



## 🎯 功能模块

### 📸 图片工具
- **图片压缩器**: 批量压缩图片，支持质量调节
- **图片格式转换**: JPG/PNG/WebP 格式互转
- **截图工具**: 网页截图和编辑功能

### ✍️ 内容工具
- **爆款标题生成器**: AI 智能生成吸引人的标题
- **字数统计器**: 实时统计字数、字符数、阅读时间
- **内容提取工具**: 支持主流平台内容解析下载
- **Markdown编辑器**: 实时预览、语法高亮、多格式导出

### 🎵 媒体工具
- **配音工具**: 系统语音 + AI音色克隆 TTS
- **封面下载器**: YouTube/B站视频封面一键下载
- **社交媒体封面**: 自定义尺寸的封面生成

### 🔧 实用工具
- **二维码生成器**: 支持文本/URL/WiFi/联系人四种类型
- **色彩工具箱**: 调色板生成、格式转换、对比度检查
- **文本工具集**: 格式转换、编码解码、正则测试、哈希生成
- **文档转换器**: 多种文档格式转换

## 📱 响应式设计

应用采用移动优先的响应式设计，完美适配：
- 📱 移动设备 (320px+)
- 📟 平板设备 (768px+) 
- 💻 桌面设备 (1024px+)
- 🖥️ 大屏设备 (1440px+)

## 🎨 设计特色

- **现代化UI**: 简洁美观的用户界面
- **暗黑模式**: 支持明暗主题切换
- **即用即走**: 无需注册，打开即用
- **隐私保护**: 数据本地处理，不上传服务器
- **极致速度**: Turbopack 加速开发，优化生产性能

## 🚀 部署选项

### Vercel (推荐)
```bash
# 一键部署到 Vercel
npx vercel
```

### 其他平台
- **Netlify**: 支持自动部署
- **Docker**: 容器化部署
- **静态托管**: 支持 GitHub Pages 等静态托管服务

## 📚 学习资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [React 19 新特性](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情。