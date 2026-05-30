# creator-tools 审计报告

**审计日期**：2026-04-29
**仓库**：https://github.com/gxuanmo/creator-tools（本地路径：`C:\Users\Administrator\Desktop\creator-tools`）
**方法**：源码审计 + `npm run build` + 浏览器实测 + `codex review` 双重核对

---

## 一、构建/类型检查

| 项 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ 无错误 |
| `npm run build`（Next.js 15.4.4 + Turbopack） | ✅ 19 个静态页全部生成 |
| 前端 `npm run dev` | ✅ 在 :4321 启动正常（:3000 被本机占用） |
| 后端 `npm run start:dev`（NestJS） | ✅ 在 :4322 启动，路由 `/api/headlines/generate`、`/api/thumbnail` 注册成功 |
| 浏览器烟雾测试 | ✅ 首页、字数统计、二维码生成器实测可用 |
| 唯一控制台错误 | `favicon.svg 404` |

### 后端 API 实测结果（坐实代码审计判断）

**`/api/thumbnail`**

| 测试用例 | 服务器响应 | 实际可用性 |
|---|---|---|
| YouTube 标准 URL `?v=dQw4w9WgXcQ` | 200, 4 个 URL | ✅ `maxresdefault.jpg` 实测 200 OK |
| YouTube 短链 `youtu.be/...` | 200 | ✅ 同上 |
| **Bilibili `BV1GJ411x7h7`** | **200, 拼接 `i0.hdslb.com/bfs/archive/{BV}.jpg`** | ❌ **实测 404 Not Found，缩略图功能完全损坏** |
| 不支持平台 | 400 `UNSUPPORTED_PLATFORM` | ✅ |
| 缺 url 参数 | 400 `MISSING_URL` | ✅ |
| **不存在的 videoId `THIS_DOESNT_EXIST`**（21 字符，超 11 位规范） | **200, 返回 maxresdefault URL** | ❌ **实测 URL 返回 404，后端无任何 ID 校验** |

**`/api/headlines/generate`**

| 测试用例 | 响应 | 评价 |
|---|---|---|
| 缺 `OPENAI_API_KEY` | 400 "OpenAI API密钥未配置" | ✅ 错误处理清晰 |
| 空/缺 topic | 400 + class-validator 数组消息 | ✅ |
| 未知 platform | 400 "平台类型必须是…" | ✅ |
| 多余字段 | 400 "property X should not exist" | ✅ whitelist 启用 |
| **`count: 99999`** | **通过校验进入 service** | ❌ 无 `@IsInt`/`@Min`/`@Max`，可被刷 OpenAI 配额 |
| **`count: "haha"`** | **通过校验进入 service** | ❌ 类型守卫缺失，应在 DTO 层 reject |

---

## 二、14 个工具的真实完成度

### ✅ 真正可用（约 7 个）
- **图片压缩** `frontend/src/app/tools/image-compressor/page.tsx`
- **图片格式转换** `image-converter/page.tsx`
- **二维码生成** `qr-generator/page.tsx`（已在浏览器实测生成成功）
- **字数统计** `word-counter/page.tsx`（已实测，中英混合分析正确）
- **色彩工具** `color-tools/page.tsx`（HEX/RGB/HSL 转换、调色板）
- **社交封面生成器** `social-cover-generator/page.tsx`（Canvas 实现）
- **标题生成器** `headline-generator/page.tsx` + 后端 OpenAI 真接口

### ⚠️ 半成品 / 文档夸大
- **截图工具**：长截图实为提示用户手动滚动，代码自承"模拟滚动" `screenshot/page.tsx:478`
- **Markdown 编辑器**：自写正则替换非真正高亮，且**直接 `dangerouslySetInnerHTML`，无 sanitize** `markdown-editor/page.tsx:42-66, 437`
- **文档转换器** `document-converter/page.tsx`：
  - MD→PDF 用 jsPDF 默认字体，**不嵌中文字体**，中文输出乱码
  - MD→DOCX 实际生成的是 HTML 包装，扩展名 `.doc`，MIME `application/msword`——不是真 docx
  - PDF/DOCX 输入只是 `await file.text()`（line 49），二进制读出来是乱码，反向转换实际不可用
- **文本工具** `text-tools/page.tsx`：
  - 哈希生成是 djb2 自定义 32 位累加（line 260），**不是 MD5/SHA**
  - 文本对比子标签硬编码"此功能正在开发中" (line 874)
- **缩略图下载器**：YouTube 仅按 videoId 拼 `img.youtube.com` URL，不验证图片存在 `backend/src/thumbnail/thumbnail.service.ts:77`

### ❌ 完全 mock / 不可用
- **内容提取工具**（README 标榜 8 平台）：
  - `setTimeout` + 硬编码 mock 数据 `content-extractor/page.tsx:142-237`
  - 下载是 `new Blob(['模拟下载内容'])` (line 297)
  - 页面底部黄色提示框自承"演示版本，显示模拟数据" (line 604)
- **Bilibili 缩略图**：注释自承需要调 API，但仅用 BV 号拼 hdslb 路径，**根本拿不到真实缩略图** `backend/src/thumbnail/thumbnail.service.ts:126-138`

---

## 三、安全问题（按严重程度）

### 🔴 严重
1. **MiniMax API Key 客户端泄露** — `voice-generator/page.tsx:288, 321, 388`
   - 使用 `process.env.NEXT_PUBLIC_MINIMAX_API_KEY` 直接从浏览器请求 MiniMax
   - `NEXT_PUBLIC_*` 前缀会把密钥打进前端 bundle，对所有访问者公开
   - 必须改为后端代理

2. **Markdown 预览 XSS** — `markdown-editor/page.tsx:42-66, 437`
   - 自写正则把 markdown 转 HTML 后直接 `dangerouslySetInnerHTML`
   - 用户粘贴 `<img src=x onerror=alert(1)>` 即可执行任意脚本
   - 文档转换器拼 Word HTML 也是同样问题 `document-converter/page.tsx:128, 151`

### 🟡 中
3. **后端无鉴权 + 无限流** — `backend/src/main.ts`
   - `enableCors({ credentials: true })` 但任何来源都能调
   - `.env.example:26` 写了 `API_RATE_LIMIT=100` 但代码未实现
   - `/api/headlines/generate` 调 OpenAI，可被刷烧钱

4. **DTO 校验不完整** — `backend/src/headline/dto/generate-headline.dto.ts:44-45`
   - `count` 仅有 `@IsOptional()`，缺 `@IsInt()` `@Min()` `@Max()`，可塞任意值

---

## 四、文档与实现对不上

| README 声称 | 实际代码 |
|---|---|
| 后端跑在 `:3001` (`README.md:143`) | 默认 `:3002` (`backend/src/config/config.service.ts:56`) |
| 前端 thumbnail-downloader 默认 `:3001` | 与后端实际默认端口不一致 |
| `backend/README.md` 列出 `/api/extract/*`、`/api/voice/*`、`/api/files/*` 共 11 个端点 | 源码里只有 `/api/headlines/generate` 和 `/api/thumbnail` 两个 |
| Swagger 文档 `/api` | 控制器有 `@ApiTags`/`@ApiOperation` 装饰器，但 `main.ts` 从未调用 `SwaggerModule.setup()`，文档页面不存在 |
| README 把 14 个工具全部勾选为完成 | 实际约 7 个真完成、4 个半成品、3 个 mock/不可用 |

---

## 五、依赖与构建配置

- 根目录 `package-lock.json` 与 `pnpm-lock.yaml` 并存——README 推荐 pnpm，但根脚本全用 `npm`
- `frontend/package-lock.json` 也存在（构建时 Next.js 警告 multiple lockfiles）
- `frontend/next.config.ts` 配置在构建时 **忽略 ESLint 错误**，会让低级问题流到生产
- 后端依赖 `openai` 包但实际全用原生 `fetch`，可移除
- 后端依赖 `@nestjs/swagger` + `swagger-ui-express` 但未启用，纯死依赖

---

## 六、自检结论

逐条核实 codex 引用的关键行号，**全部属实**：

- ✅ `markdown-editor/page.tsx:42-66, 437` — 正则替换 + `dangerouslySetInnerHTML` 无 sanitize
- ✅ `backend/src/main.ts` — 无 `SwaggerModule.setup`
- ✅ `backend/src/config/config.service.ts:56` — 默认 3002，与 README 不一致
- ✅ `text-tools/page.tsx:874` — "此功能正在开发中"硬编码
- ✅ `content-extractor/page.tsx:297` — `new Blob(['模拟下载内容'])`
- ✅ `thumbnail.service.ts:126-138` — Bilibili 缩略图仅拼 URL
- ✅ `headline DTO count` 字段无范围/类型校验

并且通过启动后端**实际打接口**进一步坐实：

- ✅ Bilibili 接口返回 success:true，但拼出的 URL **HTTP HEAD 实测 404**——功能彻底坏的
- ✅ YouTube 缩略图 URL 真实可拉，但服务端**不验证 videoId 长度/格式**，传 21 字符的 `THIS_DOESNT_EXIST` 也照样返回 success
- ✅ `count` DTO 校验缺失：传 `99999` 和字符串 `"haha"` 都通过 ValidationPipe

---

## 七、总体评价

| 维度 | 评价 |
|---|---|
| **完成度** | 约 **45%**（codex 估计与人工核验一致）。UI 铺得全，但 README 把 mock/占位/半成品全部标记为完成 |
| **可发布性** | ❌ 不建议直接上线。MiniMax 密钥前端泄露 + Markdown XSS 是阻断级问题 |
| **代码质量** | 中等偏低。前端组件实现风格不统一，存在死代码（如 `thumbnail-downloader/page.tsx:42-73` 注释掉的数组），后端有未启用的 Swagger 和未用的 openai 包 |
| **下一步建议** | ① 把 MiniMax 调用迁到后端代理；② Markdown/HTML 输出加 DOMPurify；③ README 把未完成功能改成"开发中"；④ 后端补上 Swagger setup、限流和 DTO 校验；⑤ 决定 npm/pnpm 之一并删冗余 lock 文件 |

---

## 附录

- 详细 codex 报告：[`codex-review.md`](./codex-review.md)
- 截图：`creator-tools-home.png`、`word-counter-after.png`、`qr-generated.png`、`qr-default.png`
