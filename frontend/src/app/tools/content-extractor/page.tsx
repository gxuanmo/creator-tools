'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

// 支持的平台类型
type PlatformType = 'youtube' | 'bilibili' | 'douyin' | 'xiaohongshu' | 'wechat' | 'twitter' | 'xiaoyuzhou' | 'ximalaya';

// 内容类型
type ContentType = 'video' | 'audio' | 'image' | 'text';

// 提取结果接口
interface ExtractedContent {
  id: string;
  title: string;
  description?: string;
  author: string;
  platform: PlatformType;
  contentType: ContentType;
  url: string;
  downloadUrl?: string;
  thumbnail?: string;
  duration?: string;
  publishTime?: string;
  viewCount?: number;
  likeCount?: number;
  tags?: string[];
}

// 平台配置
const platforms = {
  youtube: {
    name: 'YouTube',
    icon: '🎥',
    color: 'red',
    types: ['video'],
    urlPattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    description: '支持视频下载和信息提取'
  },
  bilibili: {
    name: 'Bilibili',
    icon: '📺',
    color: 'pink',
    types: ['video'],
    urlPattern: /bilibili\.com\/video\/(BV[\w]+|av\d+)/,
    description: '支持B站视频下载'
  },
  douyin: {
    name: '抖音',
    icon: '🎵',
    color: 'black',
    types: ['video'],
    urlPattern: /douyin\.com\/video\/([\w]+)/,
    description: '支持抖音短视频下载'
  },
  xiaohongshu: {
    name: '小红书',
    icon: '📖',
    color: 'red',
    types: ['image', 'video', 'text'],
    urlPattern: /xiaohongshu\.com\/(explore\/|discovery\/item\/)([\w]+)/,
    description: '支持图文和视频内容'
  },
  wechat: {
    name: '微信公众号',
    icon: '💬',
    color: 'green',
    types: ['text', 'image'],
    urlPattern: /mp\.weixin\.qq\.com\/s\/([\w-]+)/,
    description: '支持公众号文章提取'
  },
  twitter: {
    name: 'X (Twitter)',
    icon: '🐦',
    color: 'blue',
    types: ['text', 'image', 'video'],
    urlPattern: /(?:twitter\.com|x\.com)\/[\w]+\/status\/([\d]+)/,
    description: '支持推文内容提取'
  },
  xiaoyuzhou: {
    name: '小宇宙',
    icon: '🎧',
    color: 'purple',
    types: ['audio'],
    urlPattern: /xiaoyuzhoufm\.com\/episode\/([\w]+)/,
    description: '支持播客音频下载'
  },
  ximalaya: {
    name: '喜马拉雅',
    icon: '🎙️',
    color: 'orange',
    types: ['audio'],
    urlPattern: /ximalaya\.com\/[\w]+\/([\d]+)/,
    description: '支持音频节目下载'
  }
};

/**
 * 自媒体内容提取工具
 * 支持主流平台的视频、音频、图文内容解析和下载
 */
export default function ContentExtractor() {
  const [inputUrl, setInputUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformType | null>(null);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  /**
   * 检测URL对应的平台
   */
  const detectPlatform = useCallback((url: string): PlatformType | null => {
    for (const [key, platform] of Object.entries(platforms)) {
      if (platform.urlPattern.test(url)) {
        return key as PlatformType;
      }
    }
    return null;
  }, []);

  /**
   * 处理URL输入变化
   */
  const handleUrlChange = useCallback((url: string) => {
    setInputUrl(url);
    const platform = detectPlatform(url);
    setDetectedPlatform(platform);
    setError(null);
  }, [detectPlatform]);

  /**
   * 模拟内容提取（实际应用中需要后端API支持）
   */
  const extractContent = useCallback(async (url: string, platform: PlatformType): Promise<ExtractedContent> => {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // 根据平台生成模拟数据
    const mockData: Record<PlatformType, Partial<ExtractedContent>> = {
      youtube: {
        title: 'Amazing Tech Tutorial - Learn Programming in 2024',
        author: 'TechGuru',
        description: 'Complete guide to modern web development with React and Next.js',
        duration: '15:32',
        viewCount: 125000,
        likeCount: 8500,
        contentType: 'video',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        tags: ['programming', 'react', 'tutorial']
      },
      bilibili: {
        title: '【技术分享】前端开发最佳实践',
        author: '前端大神',
        description: '分享最新的前端开发技术和经验',
        duration: '12:45',
        viewCount: 89000,
        likeCount: 5200,
        contentType: 'video',
        thumbnail: 'https://i0.hdslb.com/bfs/archive/placeholder.jpg',
        tags: ['前端', '技术', '分享']
      },
      douyin: {
        title: '超实用的生活小技巧',
        author: '生活达人',
        description: '每天学一个小技巧，生活更美好',
        duration: '0:30',
        viewCount: 45000,
        likeCount: 3200,
        contentType: 'video',
        tags: ['生活', '技巧', '实用']
      },
      xiaohongshu: {
        title: '今日穿搭分享 | 秋季时尚搭配',
        author: '时尚博主',
        description: '分享今天的穿搭，简约而不简单的秋季look',
        viewCount: 12000,
        likeCount: 890,
        contentType: 'image',
        tags: ['穿搭', '时尚', '秋季']
      },
      wechat: {
        title: '人工智能的未来发展趋势',
        author: '科技观察',
        description: '深度分析AI技术的发展现状和未来趋势',
        viewCount: 8500,
        likeCount: 420,
        contentType: 'text',
        tags: ['AI', '科技', '趋势']
      },
      twitter: {
        title: 'Breaking: New AI breakthrough announced',
        author: '@TechNews',
        description: 'Major tech company announces revolutionary AI model',
        viewCount: 25000,
        likeCount: 1200,
        contentType: 'text',
        tags: ['AI', 'tech', 'news']
      },
      xiaoyuzhou: {
        title: '科技播客 #42 - 聊聊最新的AI发展',
        author: '科技播客',
        description: '本期节目我们聊聊最新的人工智能发展动态',
        duration: '45:20',
        viewCount: 3200,
        likeCount: 180,
        contentType: 'audio',
        tags: ['播客', 'AI', '科技']
      },
      ximalaya: {
        title: '每日英语听力练习 - 第100期',
        author: '英语学习',
        description: '提高英语听力水平的日常练习',
        duration: '20:15',
        viewCount: 15000,
        likeCount: 650,
        contentType: 'audio',
        tags: ['英语', '听力', '学习']
      }
    };

    const baseData = mockData[platform] || {};
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      platform,
      url,
      publishTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      downloadUrl: `https://mock-download.com/${platform}/${Math.random().toString(36).substr(2, 9)}`,
      ...baseData
    } as ExtractedContent;
  }, []);

  /**
   * 执行内容提取
   */
  const handleExtract = useCallback(async () => {
    if (!inputUrl.trim()) {
      setError('请输入有效的URL');
      return;
    }

    if (!detectedPlatform) {
      setError('不支持的平台，请检查URL格式');
      return;
    }

    try {
      setIsExtracting(true);
      setError(null);
      setExtractedContent(null);

      const content = await extractContent(inputUrl, detectedPlatform);
      setExtractedContent(content);

    } catch (err) {
      console.error('内容提取失败:', err);
      setError(err instanceof Error ? err.message : '提取失败，请重试');
    } finally {
      setIsExtracting(false);
    }
  }, [inputUrl, detectedPlatform, extractContent]);

  /**
   * 模拟下载功能
   */
  const handleDownload = useCallback(async () => {
    if (!extractedContent?.downloadUrl) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // 模拟下载进度
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // 模拟下载延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 创建模拟下载链接
      const fileName = `${extractedContent.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.${extractedContent.contentType === 'video' ? 'mp4' : extractedContent.contentType === 'audio' ? 'mp3' : 'zip'}`;
      
      // 实际应用中这里应该是真实的文件下载
      const blob = new Blob(['模拟下载内容'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = fileName;
        downloadLinkRef.current.click();
      }
      
      URL.revokeObjectURL(url);
      clearInterval(interval);
      setDownloadProgress(100);
      
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  }, [extractedContent]);

  /**
   * 重置所有状态
   */
  const handleReset = useCallback(() => {
    setInputUrl('');
    setDetectedPlatform(null);
    setExtractedContent(null);
    setError(null);
    setDownloadProgress(0);
  }, []);

  return (
    <>
      <SEO {...seoConfigs.contentExtractor} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <span className="text-xl">←</span>
                <span>返回首页</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">自媒体内容提取工具</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：输入和平台选择 */}
            <div className="space-y-6">
              {/* 支持的平台 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">支持的平台</h2>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(platforms).map(([key, platform]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        detectedPlatform === key
                          ? `border-${platform.color}-500 bg-${platform.color}-50`
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{platform.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{platform.name}</div>
                          <div className="text-xs text-gray-500">
                            {platform.types.map(type => {
                              const typeNames = {
                                video: '视频',
                                audio: '音频', 
                                image: '图片',
                                text: '文本'
                              };
                              return typeNames[type as ContentType];
                            }).join('、')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* URL输入 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">输入链接</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容链接
                    </label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="粘贴视频、音频或图文链接..."
                    />
                    {detectedPlatform && (
                      <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                        <span>✓</span>
                        <span>检测到 {platforms[detectedPlatform].name} 链接</span>
                      </div>
                    )}
                  </div>

                  {/* 质量选择 */}
                  {detectedPlatform && platforms[detectedPlatform].types.includes('video') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        视频质量
                      </label>
                      <select
                        value={selectedQuality}
                        onChange={(e) => setSelectedQuality(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1080p">1080p (高清)</option>
                        <option value="720p">720p (标清)</option>
                        <option value="480p">480p (流畅)</option>
                        <option value="audio">仅音频</option>
                      </select>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleExtract}
                      disabled={!inputUrl.trim() || !detectedPlatform || isExtracting}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isExtracting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>解析中...</span>
                        </div>
                      ) : (
                        '开始解析'
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      重置
                    </button>
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：提取结果 */}
            <div className="space-y-6">
              {extractedContent ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">提取结果</h2>
                  
                  {/* 内容信息 */}
                  <div className="space-y-4">
                    {/* 缩略图 */}
                    {extractedContent.thumbnail && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={extractedContent.thumbnail}
                          alt={extractedContent.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDQgNzJMMTc2IDk2TDE0NCAxMjBWNzJaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      </div>
                    )}

                    {/* 基本信息 */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{extractedContent.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center space-x-1">
                          <span>{platforms[extractedContent.platform].icon}</span>
                          <span>{platforms[extractedContent.platform].name}</span>
                        </span>
                        <span>@{extractedContent.author}</span>
                        {extractedContent.duration && (
                          <span>⏱️ {extractedContent.duration}</span>
                        )}
                      </div>
                      {extractedContent.description && (
                        <p className="text-gray-700 text-sm mb-3">{extractedContent.description}</p>
                      )}
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      {extractedContent.viewCount && (
                        <span>👁️ {extractedContent.viewCount.toLocaleString()} 播放</span>
                      )}
                      {extractedContent.likeCount && (
                        <span>👍 {extractedContent.likeCount.toLocaleString()} 点赞</span>
                      )}
                      {extractedContent.publishTime && (
                        <span>📅 {new Date(extractedContent.publishTime).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* 标签 */}
                    {extractedContent.tags && extractedContent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {extractedContent.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 下载按钮 */}
                    <div className="pt-4 border-t">
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>下载中... {Math.round(downloadProgress)}%</span>
                          </>
                        ) : (
                          <>
                            <span>📥</span>
                            <span>下载内容</span>
                          </>
                        )}
                      </button>
                      
                      {/* 下载进度条 */}
                      {isDownloading && downloadProgress > 0 && (
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${downloadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">等待解析内容</h3>
                    <p className="text-gray-600">请在左侧输入链接并点击解析按钮</p>
                  </div>
                </div>
              )}

              {/* 使用说明 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>复制想要下载的内容链接</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>粘贴到输入框，系统自动识别平台</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>选择下载质量（视频内容）</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>点击解析获取内容信息</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>点击下载按钮保存到本地</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800">
                    <strong>注意：</strong> 当前为演示版本，显示模拟数据。实际应用需要后端API支持和相关平台授权。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 隐藏的下载链接 */}
        <a ref={downloadLinkRef} className="hidden" />
      </div>
    </>
  );
}