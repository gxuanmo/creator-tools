# 创作者工具箱 - 后端服务

基于 NestJS 构建的创作者工具箱后端 API 服务，为前端应用提供数据处理和第三方服务集成支持。

## 🚀 项目简介

本项目是创作者工具箱的后端服务，采用 NestJS 框架开发，提供 RESTful API 接口，支持以下核心功能：

- **缩略图服务**: YouTube视频缩略图提取和解析（已实现）
- **AI 服务**: 基于OpenAI的爆款标题生成（已实现）
- **内容提取服务**: 支持主流自媒体平台内容解析（计划实现）
- **配音服务**: 集成 MiniMax API 提供 TTS 和音色克隆功能（计划实现）
- **文件处理服务**: 图片压缩、格式转换等（计划实现）

## 🏗️ 技术栈

- **框架**: NestJS (Node.js)
- **语言**: TypeScript
- **数据库**: 暂未使用（V2.0版本使用localStorage）
- **缓存**: Redis（计划支持）
- **文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest

## 📦 项目结构

backend/
├── src/
│   ├── app.controller.ts      # 应用主控制器
│   ├── app.module.ts          # 应用主模块
│   ├── app.service.ts         # 应用主服务
│   ├── main.ts               # 应用入口文件
│   ├── config/               # 配置模块
│   │   └── config.service.ts # 配置服务
│   ├── headline/             # 标题生成模块
│   │   ├── dto/             # 数据传输对象
│   │   ├── headline.controller.ts
│   │   ├── headline.service.ts
│   │   └── headline.module.ts
│   └── thumbnail/            # 缩略图模块
│       ├── dto/             # 数据传输对象
│       ├── thumbnail.controller.ts
│       ├── thumbnail.service.ts
│       └── thumbnail.module.ts
├── test/                     # 测试文件
│   ├── app.e2e-spec.ts      # 端到端测试
│   └── jest-e2e.json        # Jest E2E 配置
├── dist/                     # 编译输出目录
├── package.json              # 项目依赖配置
├── nest-cli.json            # NestJS CLI 配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.build.json       # 构建配置
└── README.md                 # 项目说明文档


## 🛠️ 开发环境设置

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

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置以下环境变量：

```env
# 服务端口
PORT=3001

# MiniMax API 配置（配音功能）
MINIMAX_API_KEY=your_minimax_api_key
MINIMAX_GROUP_ID=your_group_id

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# 其他第三方服务配置
# YOUTUBE_API_KEY=your_youtube_api_key
# BILIBILI_API_KEY=your_bilibili_api_key
```

## 🚀 运行项目

```bash
# 开发模式
pnpm start:dev

# 生产模式
pnpm start:prod

# 调试模式
pnpm start:debug

# 或使用 npm
npm run start:dev
npm run start:prod
npm run start:debug
```

## 🧪 测试

```bash
# 单元测试
pnpm test

# 端到端测试
pnpm test:e2e

# 测试覆盖率
pnpm test:cov

# 监听模式测试
pnpm test:watch
```

## 📚 API 文档

启动服务后，访问 `http://localhost:3001/api` 查看 Swagger API 文档。

### 主要 API 端点

#### 基础接口
- `GET /` - 健康检查和服务状态
- `GET /health` - 服务健康状态检查

#### 缩略图服务（已实现）
- `GET /api/thumbnail` - YouTube视频缩略图提取
- `GET /api/thumbnail/health` - 缩略图服务健康检查

#### AI 服务（已实现）
- `POST /api/headlines/generate` - 爆款标题生成
- `GET /api/headlines/health` - 标题生成服务健康检查

#### 内容提取服务（计划实现）
- `POST /api/extract/url` - URL 内容提取
- `POST /api/extract/batch` - 批量内容提取
- `GET /api/extract/platforms` - 支持的平台列表

#### 配音服务（计划实现）
- `POST /api/voice/tts` - 文本转语音
- `POST /api/voice/clone` - 音色克隆
- `GET /api/voice/languages` - 支持的语言列表
- `GET /api/voice/voices` - 可用音色列表

#### 文件处理服务（计划实现）
- `POST /api/files/compress` - 图片压缩
- `POST /api/files/convert` - 格式转换
- `POST /api/files/upload` - 文件上传

## 🔧 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 使用 kebab-case 命名文件和目录
- 使用 PascalCase 命名类和接口
- 使用 camelCase 命名变量和函数

### 架构规范
- 严格遵循 Module-Controller-Service 分层架构
- 使用 DTO 进行数据传输对象定义
- 使用依赖注入管理服务
- 统一错误处理和响应格式

### Git 提交规范

feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
perf: 性能优化


## 📦 构建和部署

### 本地构建
```bash
# 构建项目
pnpm build

# 启动生产版本
pnpm start:prod
```

### Docker 部署
```bash
# 构建镜像
docker build -t creator-tools-backend .

# 运行容器
docker run -p 3001:3001 creator-tools-backend
```

### 云平台部署
- **Render**: 推荐用于快速部署
- **Railway**: 支持自动部署
- **Vercel**: 支持 Serverless 函数
- **AWS/阿里云**: 企业级部署方案

## 🔍 监控和日志

### 日志配置
- 使用 NestJS 内置日志系统
- 支持不同日志级别（error, warn, log, debug, verbose）
- 生产环境建议使用结构化日志

### 性能监控
- 集成健康检查端点
- 支持应用性能监控（APM）
- 错误追踪和报告

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](../LICENSE)。

## 🔗 相关链接

- [前端项目](../frontend/README.md)
- [项目文档](../docs/)
- [产品需求文档](../docs/prd.md)
- [NestJS 官方文档](https://docs.nestjs.com)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)

---

如有问题或建议，请提交 [Issue](https://github.com/your-username/creator-tools/issues) 或联系开发团队。