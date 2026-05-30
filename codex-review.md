## 代码审查报告

**功能真实性**

README 在 `README.md:20-39` 标记 14 个功能均已完成，但实际只有约 7 个较可用。

可用或基本可用：图片压缩 `frontend/src/app/tools/image-compressor/page.tsx:47`、图片格式转换 `image-converter/page.tsx:56`、二维码生成 `qr-generator/page.tsx:154`、字数统计 `word-counter/page.tsx:37`、色彩转换/调色板/取色 `color-tools/page.tsx:47,146,241`、社交封面基础 Canvas 生成 `social-cover-generator/page.tsx:116`、标题生成前后端链路 `headline-generator/page.tsx:234` + `backend/src/headline/headline.service.ts:29`。

部分可用但文档夸大：截图工具能用 `getDisplayMedia` 截屏，但“长截图”需要用户手动滚动，代码注释也承认是模拟滚动 `screenshot/page.tsx:478`；Markdown 编辑器是正则替换，不是真语法高亮 `markdown-editor/page.tsx:42`；缩略图下载器只拼 URL，不查视频真实性 `backend/src/thumbnail/thumbnail.service.ts:77`。

占位/模拟：内容提取器完全 mock，生成假数据和假下载 `content-extractor/page.tsx:142,145,234,297`；文本对比只是 UI，占位提示开发中 `text-tools/page.tsx:832,863,874`；文本工具的哈希明确是“模拟” `text-tools/page.tsx:260`；文档转换只支持 Markdown 到 PDF/伪 Word，PDF/Docx 输入只是 `file.text()` 读取 `document-converter/page.tsx:49,179`。

**安全问题**

严重：MiniMax API Key 在客户端暴露，使用 `NEXT_PUBLIC_MINIMAX_API_KEY` 直接请求 MiniMax `voice-generator/page.tsx:288,321,388`。这会把密钥打进前端 bundle，应改为后端代理。

严重：Markdown 预览无任何 sanitize，直接 `dangerouslySetInnerHTML` 渲染用户输入 `markdown-editor/page.tsx:42,437`，`<img onerror>` / 恶意链接可 XSS。文档转换的 Word HTML 也拼接未净化 HTML `document-converter/page.tsx:128,151`。

SSRF：当前后端缩略图服务不直接 fetch 用户 URL，只基于正则拼固定域名，暂无典型 SSRF。但 URL 检测用 `includes` 很粗糙 `thumbnail.service.ts:34`。

CORS/滥用：后端开放 `credentials: true` `backend/src/main.ts:22-26`，但没有鉴权/限流；`.env.example:26` 写了 `API_RATE_LIMIT` 却未实现，OpenAI 标题接口可被刷成本。

**后端真实性**

Headline 是真实 OpenAI 调用，但硬编码旧模型 `gpt-3.5-turbo`，错误处理把上游错误直接返回 `headline.service.ts:36,76`；`count` 只有 `@IsOptional`，没有数字/范围校验 `generate-headline.dto.ts:44`。Thumbnail 的 YouTube 只构造 `img.youtube.com` URL，不验证视频或图片存在 `thumbnail.service.ts:83`；Bilibili 明确注释“需要调用 API 获取真实 URL”，却用 BV 号拼 hdslb 路径，基本不可用 `thumbnail.service.ts:126-135`。

**文档与实现不符**

后端 README 声称 Swagger `/api`，但 `main.ts` 没有 `SwaggerModule.setup`；还列出 extract/voice/files API，但源码不存在 `backend/README.md:128,145-158`。主 README 说后端 3001，但配置默认 3002 `README.md:143`、`config.service.ts:56`。README 还说 MiniMax 主要配置，但真实实现放在前端且不安全 `README.md:132`。

**依赖/构建**

根目录同时有 `package-lock.json` 和 `pnpm-lock.yaml`，README 推荐 pnpm，但根脚本全用 npm `package.json:7-19`。前端又出现未跟踪 `frontend/package-lock.json`。`frontend/next.config.ts:4-5` 构建时忽略 ESLint，容易隐藏问题。后端依赖 `openai` 包但实际用原生 `fetch`，Swagger 依赖也未真正启用。

**总体结论**

项目完成度约 **45%**：UI 页面铺得较全，纯前端小工具有一半能用；但 README 把 mock、占位和不完整实现全部标为完成，安全上有客户端 API Key 暴露和 Markdown XSS，后端只完成两个低成熟度接口。未按请求运行构建/测试，仅做源码审查。