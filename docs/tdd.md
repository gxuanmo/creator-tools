# "创作者工具箱" (Creator Tools) V2.0 设计与技术需求文档 (DRD)

**版本:** 2.0
**更新日期:** 2025年7月28日

## 1. 技术栈总览

  - **前端:** Next.js (React)
  - **后端:** NestJS (Node.js)
  - **数据库:** V1.0 版本不使用数据库
  - **ORM:** V1.0 版本不使用ORM
  - **开发语言:** TypeScript
  - **部署:** 前端(Vercel), 后端(Render/Railway)

## 2. 系统架构

本项目采用前后端分离的现代Jamstack架构。

  - **前端:** 部署在Vercel的全球CDN网络，负责所有UI展示和纯客户端工具逻辑。
  - **后端API:** 部署为独立的Serverless服务，仅处理需要服务器计算或调用第三方API的逻辑（如标题生成）。
  - **数据存储:** V1.0版本**无数据库**。所有非持久化状态在组件内管理，少量持久化状态（如收藏夹、历史记录）使用浏览器`localStorage`。

## 3. 项目结构 (Monorepo)

```
/creator-tools
├── /frontend      # Next.js 前端项目
│   ├── /app
│   │   ├── /tools
│   │   │   ├── /image-compressor
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── /backend       # NestJS 后端项目
    ├── /src
    │   ├── /ai-tools
    │   │   └── headline.controller.ts
    │   └── ...
    └── ...
```

## 4. API 接口设计 (V1.0)

V1.0 版本需要2个后端API接口。

### 4.1. `POST /api/headlines` (爆款标题生成器)

  - **功能:** 根据关键词和平台生成标题。
  - **请求体 (Request Body):**
    ```json
    {
      "keywords": "AI绘画入门",
      "platforms": ["小红书", "B站"],
      "tone": "教程干货" 
    }
    ```
  - **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "小红书": [
          "🎨AI绘画保姆级教程｜3分钟让你的照片秒变二次元！",
          "..."
        ],
        "B站": [
          "【AI绘画】从零开始，我用一个下午学会了Midjourney，你也可以！",
          "..."
        ]
      }
    }
    ```
  - **失败响应 (400/500):**
    ```json
    {
      "success": false,
      "error": "请求参数错误或服务器内部错误"
    }
    ```

### 4.2. `GET /api/thumbnail` (封面下载器)

  - **功能:** 解析视频链接并返回封面图URL。
  - **请求参数 (Query Params):** `?url=<VIDEO_URL>`
  - **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "platform": "youtube",
        "thumbnails": {
          "default": "...",
          "medium": "...",
          "high": "...",
          "maxres": "..."
        }
      }
    }
    ```
  - **失败响应 (400/404):**
    ```json
    {
      "success": false,
      "error": "无效的链接或无法解析该视频"
    }
    ```

## 5. 纯前端工具技术要点

  - **图片压缩器 & 格式转换器:**
      - **核心库:** `browser-image-compression`。该库可在浏览器端高效处理图片压缩和格式转换。
      - **批量下载:** `jszip`。该库可在浏览器端将多张图片打包成zip文件。
  - **字数统计器:**
      - 纯JavaScript逻辑，通过监听文本域的`onChange`事件，实时计算并更新结果。

## 6. 部署方案

  - **前端:** `frontend`目录下的Next.js项目，连接到GitHub仓库后，部署在 **Vercel**。
  - **后端:** `backend`目录下的NestJS项目，连接到GitHub仓库后，部署在 **Render** 或 **Railway**。
  - **环境变量:** 第三方API密钥（如OpenAI Key）必须配置在后端部署平台的环境变量中，严禁硬编码在代码里。