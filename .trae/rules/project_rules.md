# 项目规则 (Project Rules for "creator-tools")

## 1. 项目核心技术栈 (V2.0)
- **前端**: Next.js (使用 App Router)
- **后端**: NestJS
- **数据库/ORM**: **V2.0 版本不使用数据库或ORM**。数据持久化使用浏览器 `localStorage`。
- **开发语言**: TypeScript
- **代码风格**: ESLint + Prettier

## 2. 项目结构
- 这是一个 Monorepo 项目，包含两个主要目录：`frontend` 和 `backend`。
- 在回答问题或生成代码时，请明确你正在为哪个部分（前端或后端）提供解决方案。

## 3. 前端 (Next.js) 开发规范
- **路由**: 始终使用 **App Router** (`/app` 目录结构)。
- **组件**: 优先使用 **Server Components**。只有在需要交互、Hooks 或浏览器 API 时才使用 `'use client'` 声明为 Client Components。
- **样式**: 使用 **Tailwind CSS** 进行样式开发。
- **状态管理**: 优先使用 React 原生 Hooks (`useState`, `useContext`, `useReducer`)。

## 4. 后端 (NestJS) 开发规范
- **架构**: 严格遵守 **Module, Controller, Service** 的分层架构。
- **DTO (Data Transfer Object)**: 所有 Controller 的请求体都必须定义 DTO 类，并使用 `class-validator` 和 `class-transformer` 进行验证和转换。
- **数据库操作**: **V2.0 版本严禁任何数据库操作**。所有逻辑均为无状态或基于请求输入。
- **依赖注入**: 严格使用 NestJS 的依赖注入系统来管理 Service 和其他 Provider。

## 5. 通用命名规范
- **API 端点**: 使用小写字母和连字符 (kebab-case)，例如 `/api/generate-headlines`。
- **文件名**: 使用小写字母和点号分隔符，遵循 `[name].[type].ts` 格式，例如 `headline.controller.ts`, `user.service.ts`。
- **变量/函数名**: 使用小驼峰式命名 (lowerCamelCase)，例如 `getUserById`, `mainContent`。