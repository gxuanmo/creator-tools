import { NextResponse } from 'next/server';

/**
 * 生成网站地图
 * 帮助搜索引擎更好地索引网站内容
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://creator-tools.com';
  
  const routes = [
    {
      url: '',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: '/tools/image-compressor',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: '/tools/headline-generator',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: '/tools/thumbnail-downloader',
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.9
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}