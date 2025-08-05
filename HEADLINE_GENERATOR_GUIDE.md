# 🎯 标题生成器功能迁移指南

## 📋 概述

标题生成器功能已成功从前端迁移到后端，现在通过NestJS API提供服务。这样做的好处包括：

- ✅ **安全性提升**：API密钥在后端安全存储
- ✅ **CORS支持**：解决跨域请求问题
- ✅ **统一管理**：集中处理API调用和错误处理
- ✅ **成本控制**：后端可以实现速率限制和使用监控

## 🏗️ 已创建的文件结构

```
backend/src/
├── config/
│   ├── config.module.ts     # 配置模块
│   └── config.service.ts    # 配置服务（环境变量管理）
└── headline/
    ├── dto/
    │   └── generate-headline.dto.ts  # 请求/响应数据结构
    ├── headline.controller.ts        # HTTP控制器
    ├── headline.service.ts          # 业务逻辑服务
    └── headline.module.ts           # 标题生成器模块
```

## ⚙️ 环境配置

### 1. 后端环境变量（.env文件）

确保根目录的`.env`文件包含以下配置：

```env
# 后端服务配置
PORT=3001
NODE_ENV=development

# OpenAI API配置（必需）
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 2. 前端环境变量（frontend/.env.local）

```env
# API基础URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 🚀 启动服务

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖（如果还没安装）
npm install @nestjs/config openai class-validator class-transformer

# 启动开发服务器
pnpm run start:dev
```

成功启动后，你会看到：
```
🚀 后端服务已启动: http://localhost:3001
📝 标题生成器API: http://localhost:3001/api/headlines/generate
```

### 2. 启动前端服务

```bash
# 进入前端目录
cd frontend

# 启动开发服务器
pnpm run dev
```

## 🧪 API测试

### 使用提供的测试脚本

```bash
# 在项目根目录运行
node test-headline-api.js
```

### 手动API测试

#### 健康检查
```bash
curl -X POST http://localhost:3001/api/headlines/health
```

#### 生成标题
```bash
curl -X POST http://localhost:3001/api/headlines/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "如何学习JavaScript编程",
    "keywords": "JavaScript, 编程, 学习",
    "platform": "youtube",
    "tone": "informative",
    "count": 5
  }'
```

## 📝 API接口文档

### POST /api/headlines/generate

生成标题的主要接口。

**请求体参数：**

| 参数 | 类型 | 必需 | 描述 | 可选值 |
|------|------|------|------|---------|
| topic | string | ✅ | 主题内容 | 1-500字符 |
| keywords | string | ❌ | 关键词 | 最多200字符 |
| platform | string | ❌ | 目标平台 | youtube, tiktok, instagram, twitter, blog, general |
| tone | string | ❌ | 语调风格 | professional, casual, humorous, dramatic, informative |
| count | number | ❌ | 生成数量 | 默认5个 |

**响应格式：**

```json
{
  "headlines": [
    "标题1",
    "标题2",
    "标题3"
  ],
  "timestamp": "2025-08-04T07:05:56.050Z",
  "parameters": {
    "topic": "如何学习JavaScript编程",
    "keywords": "JavaScript, 编程, 学习",
    "platform": "youtube",
    "tone": "informative",
    "count": 5
  }
}
```

### POST /api/headlines/health

健康检查接口。

**响应格式：**
```json
{
  "status": "ok",
  "timestamp": "2025-08-04T07:05:56.050Z"
}
```

## 🔧 前端集成

### 1. 使用示例代码

参考 `frontend-api-integration-example.tsx` 文件，它展示了：

- ✅ 完整的React组件实现
- ✅ TypeScript类型定义
- ✅ 错误处理和加载状态
- ✅ 响应式UI设计
- ✅ 复制到剪贴板功能

### 2. 替换现有页面

将现有的标题生成器页面（`frontend/src/app/headline-generator/page.tsx`）替换为新的API调用版本。

### 3. API调用函数

```typescript
const generateHeadlines = async (data: GenerateHeadlineRequest): Promise<HeadlineResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/headlines/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '标题生成失败');
  }

  return response.json();
};
```

## ❗ 常见问题

### 1. "OpenAI API密钥未配置"错误

**解决方案：**
- 在根目录的`.env`文件中设置`OPENAI_API_KEY=sk-your-key-here`
- 重启后端服务

### 2. CORS错误

**解决方案：**
- 检查`.env`文件中的`CORS_ORIGIN`设置
- 确保前端运行在配置的域名上

### 3. 网络连接错误

**解决方案：**
- 确保后端服务在`http://localhost:3001`运行
- 检查防火墙设置
- 验证前端的`NEXT_PUBLIC_API_BASE_URL`配置

### 4. 依赖安装失败

**解决方案：**
- 使用`npm install`代替`pnpm install`
- 检查网络连接
- 清除缓存：`npm cache clean --force`

## 🎯 下一步计划

1. **YouTube缩略图下载器**：迁移YouTube Data API调用
2. **配音工具**：集成MiniMax TTS API
3. **内容提取工具**：实现网页内容抓取
4. **速率限制**：添加API调用频率控制
5. **日志记录**：添加详细的API使用日志

## 📞 技术支持

如果遇到问题，请检查：

1. ✅ 后端服务是否正常启动
2. ✅ 环境变量是否正确配置
3. ✅ 网络连接是否正常
4. ✅ API密钥是否有效

---

**🎉 恭喜！标题生成器功能迁移完成！**

现在你拥有了一个更安全、更可靠的标题生成服务。