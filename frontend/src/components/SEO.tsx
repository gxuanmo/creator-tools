import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * SEO优化组件
 * 提供统一的页面元数据管理
 */
export default function SEO({
  title = 'Creator Tools - 创作者工具箱',
  description = '免费的在线创作者工具集合，包括图片压缩、标题生成、YouTube缩略图下载等实用功能',
  keywords = '图片压缩,标题生成,YouTube缩略图,创作者工具,在线工具,免费工具',
  image = '/og-image.jpg',
  url = 'https://creator-tools.com',
  type = 'website',
  noindex = false
}: SEOProps) {
  const fullTitle = title.includes('Creator Tools') ? title : `${title} - Creator Tools`;
  const fullUrl = url.startsWith('http') ? url : `https://creator-tools.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://creator-tools.com${image}`;
  const keywordContent = Array.isArray(keywords) ? keywords.join(',') : keywords;

  return (
    <Head>
      {/* 基础元数据 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordContent} />
      <meta name="author" content="Creator Tools Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* 搜索引擎指令 */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Creator Tools" />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@CreatorTools" />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Creator Tools',
            description: description,
            url: fullUrl,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CNY'
            },
            creator: {
              '@type': 'Organization',
              name: 'Creator Tools Team'
            }
          })
        }}
      />
      
      {/* 预连接到外部资源 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* 图标 */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* 规范链接 */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}

/**
 * 页面特定的SEO配置
 */
export const seoConfigs = {
  home: {
    title: 'Creator Tools - 免费在线创作者工具箱',
    description: '提供图片压缩、标题生成、YouTube缩略图下载等免费在线工具，助力内容创作者提升工作效率',
    keywords: '创作者工具,在线工具,图片压缩,标题生成,YouTube缩略图,免费工具,内容创作'
  },
  imageCompressor: {
    title: '在线图片压缩工具',
    description: '免费的在线图片压缩工具，支持JPG、PNG、WebP格式，保持高质量的同时大幅减小文件大小',
    keywords: '图片压缩,在线压缩,JPG压缩,PNG压缩,WebP压缩,图片优化,文件压缩'
  },
  headlineGenerator: {
    title: '智能标题生成器',
    description: '基于关键词生成吸引人的标题，支持YouTube、博客、社交媒体等多种场景的标题创作',
    keywords: '标题生成,YouTube标题,博客标题,社交媒体标题,内容营销,标题优化'
  },
  thumbnailDownloader: {
    title: 'YouTube缩略图下载器',
    description: '快速下载YouTube视频缩略图，支持多种分辨率，批量下载，完全免费使用',
    keywords: 'YouTube缩略图,缩略图下载,视频封面,YouTube工具,批量下载'
  },
  markdownEditor: {
    title: 'Markdown编辑器',
    description: '专业的在线Markdown编辑器，支持实时预览、语法高亮、多格式导出，提升写作效率',
    keywords: 'Markdown编辑器,在线编辑器,实时预览,语法高亮,文档编辑,技术写作,博客写作'
  },
  textTools: {
    title: '文本工具集',
    description: '全面的文本处理工具集合，包含格式转换、编码解码、正则测试、文本分析等功能',
    keywords: '文本工具,格式转换,编码解码,正则表达式,文本处理,开发工具,Base64,URL编码'
  },
  screenshot: {
    title: '在线截图工具',
    description: '免费的屏幕截图工具，支持普通截图和长截图，多种格式输出，高质量图片保存',
    keywords: '截图工具,屏幕截图,长截图,在线截图,网页截图,桌面截图,图片保存,PNG,JPEG,WebP'
  },
  documentConverter: {
    title: '文档格式转换器',
    description: '免费的在线文档格式转换工具，支持Markdown与PDF/Word格式互转，自定义样式和布局',
    keywords: '文档转换,Markdown转PDF,Markdown转Word,PDF转换,Word转换,格式转换,在线转换,文档工具'
  },
  socialCoverGenerator: {
    title: '社交媒体封面生成器',
    description: '免费的社交媒体封面制作工具，支持YouTube、Facebook、Twitter、LinkedIn等平台，专业模板设计',
    keywords: '社交媒体封面,YouTube封面,Facebook封面,Twitter封面,封面设计,在线制作,免费工具'
  },
  voiceGenerator: {
    title: '配音工具 (TTS)',
    description: '免费的文本转语音工具，支持多语言配音，语速音调可调，在线生成高质量语音文件',
    keywords: '文本转语音,TTS,配音工具,语音合成,多语言配音,在线配音,免费工具'
  },
  contentExtractor: {
    title: '内容提取工具',
    description: '免费的内容提取工具，从网页、文档中提取文本、图片、链接等内容，支持多种格式导出',
    keywords: '内容提取,网页提取,文本提取,图片提取,链接提取,数据提取,在线工具,免费工具'
  }
};
