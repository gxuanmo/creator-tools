'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface CoverTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  gradient: string;
}

interface CoverOptions {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  template: CoverTemplate;
}

interface GeneratedCover {
  dataUrl: string;
  fileName: string;
  template: CoverTemplate;
}

/**
 * 社交媒体封面生成器页面组件
 * 支持多种社交平台的封面尺寸和模板
 */
export default function SocialCoverGenerator() {
  const [options, setOptions] = useState<CoverOptions>({
    title: '您的标题',
    subtitle: '副标题或描述',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    fontSize: 48,
    fontFamily: 'Arial',
    template: {
      id: 'youtube',
      name: 'YouTube封面',
      width: 2560,
      height: 1440,
      description: '16:9比例，适用于YouTube频道封面',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  });
  
  const [generatedCover, setGeneratedCover] = useState<GeneratedCover | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 预定义模板
  const templates: CoverTemplate[] = [
    {
      id: 'youtube',
      name: 'YouTube封面',
      width: 2560,
      height: 1440,
      description: '16:9比例，适用于YouTube频道封面',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'facebook',
      name: 'Facebook封面',
      width: 1200,
      height: 630,
      description: '适用于Facebook页面封面',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'twitter',
      name: 'Twitter封面',
      width: 1500,
      height: 500,
      description: '3:1比例，适用于Twitter个人资料',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn封面',
      width: 1584,
      height: 396,
      description: '4:1比例，适用于LinkedIn个人资料',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'instagram',
      name: 'Instagram帖子',
      width: 1080,
      height: 1080,
      description: '1:1正方形，适用于Instagram帖子',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 'bilibili',
      name: 'B站封面',
      width: 1920,
      height: 1080,
      description: '16:9比例，适用于B站视频封面',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
  ];

  /**
   * 生成封面图片
   */
  const generateCover = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas元素未找到');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取Canvas上下文');
      }

      // 设置画布尺寸
      canvas.width = options.template.width;
      canvas.height = options.template.height;

      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // 解析渐变色
      if (options.backgroundColor.startsWith('#')) {
        // 纯色背景
        ctx.fillStyle = options.backgroundColor;
      } else {
        // 使用模板渐变
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
      }
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 添加装饰性图形
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#FFFFFF';
      
      // 绘制圆形装饰
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 200 + 50;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;

      // 设置文字样式
      ctx.fillStyle = options.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 绘制主标题
      const titleFontSize = Math.max(options.fontSize, 24);
      ctx.font = `bold ${titleFontSize}px ${options.fontFamily}, sans-serif`;
      
      // 文字描边效果
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeText(options.title, canvas.width / 2, canvas.height / 2 - titleFontSize / 2);
      ctx.fillText(options.title, canvas.width / 2, canvas.height / 2 - titleFontSize / 2);

      // 绘制副标题
      if (options.subtitle.trim()) {
        const subtitleFontSize = Math.max(titleFontSize * 0.6, 16);
        ctx.font = `${subtitleFontSize}px ${options.fontFamily}, sans-serif`;
        ctx.strokeText(options.subtitle, canvas.width / 2, canvas.height / 2 + titleFontSize);
        ctx.fillText(options.subtitle, canvas.width / 2, canvas.height / 2 + titleFontSize);
      }

      // 添加品牌标识区域
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(canvas.width - 200, canvas.height - 80, 180, 60);
      ctx.globalAlpha = 1;

      // 生成结果
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const fileName = `${options.template.name}_${Date.now()}.png`;
      
      setGeneratedCover({
        dataUrl,
        fileName,
        template: options.template
      });

    } catch (err) {
      console.error('生成封面失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  /**
   * 下载生成的封面
   */
  const handleDownload = useCallback(() => {
    if (!generatedCover) return;

    const link = document.createElement('a');
    link.href = generatedCover.dataUrl;
    link.download = generatedCover.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedCover]);

  /**
   * 选择模板
   */
  const selectTemplate = useCallback((template: CoverTemplate) => {
    setOptions(prev => ({ ...prev, template }));
    setGeneratedCover(null);
  }, []);

  /**
   * 重置设置
   */
  const handleReset = useCallback(() => {
    setOptions({
      title: '您的标题',
      subtitle: '副标题或描述',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      fontSize: 48,
      fontFamily: 'Arial',
      template: templates[0]
    });
    setGeneratedCover(null);
    setError(null);
  }, [templates]);

  return (
    <>
      <SEO {...seoConfigs.socialCoverGenerator} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <span className="text-xl">←</span>
                <span>返回首页</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">社交媒体封面生成器</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：设置面板 */}
            <div className="space-y-6">
              {/* 模板选择 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">选择模板</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        options.template.id === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {template.width} × {template.height}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 文字设置 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">文字设置</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主标题
                    </label>
                    <input
                      type="text"
                      value={options.title}
                      onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="输入主标题"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      副标题
                    </label>
                    <input
                      type="text"
                      value={options.subtitle}
                      onChange={(e) => setOptions(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="输入副标题（可选）"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字体大小
                      </label>
                      <input
                        type="range"
                        min="24"
                        max="120"
                        value={options.fontSize}
                        onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-600 text-center">{options.fontSize}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字体
                      </label>
                      <select
                        value={options.fontFamily}
                        onChange={(e) => setOptions(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 颜色设置 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">颜色设置</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      背景颜色
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={options.backgroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={options.backgroundColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      文字颜色
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={options.textColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={options.textColor}
                        onChange={(e) => setOptions(prev => ({ ...prev, textColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateCover}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <span>🎨</span>
                      <span>生成封面</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：预览和结果 */}
            <div className="space-y-6">
              {/* 预览区域 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">预览</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {generatedCover ? (
                    <div className="text-center">
                      <img
                        src={generatedCover.dataUrl}
                        alt="生成的封面"
                        className="max-w-full max-h-[400px] rounded-lg shadow-md mx-auto"
                      />
                      <div className="mt-4 text-sm text-gray-600">
                        {generatedCover.template.name} - {generatedCover.template.width} × {generatedCover.template.height}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div>点击"生成封面"查看预览</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 下载区域 */}
              {generatedCover && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">封面生成完成</h3>
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
                    <div>
                      <p className="font-medium text-gray-900">{generatedCover.fileName}</p>
                      <p className="text-sm text-gray-600">
                        尺寸: {generatedCover.template.width} × {generatedCover.template.height}
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>📥</span>
                      <span>下载</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* 隐藏的canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* 使用说明 */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">操作步骤</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">1.</span>
                    <span>选择适合的社交媒体平台模板</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">2.</span>
                    <span>输入主标题和副标题文字</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">3.</span>
                    <span>调整字体大小、颜色和背景</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">4.</span>
                    <span>点击生成封面并预览效果</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">5.</span>
                    <span>满意后下载高清PNG格式图片</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">支持的平台</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• <strong>YouTube:</strong> 2560×1440 频道封面</div>
                  <div>• <strong>Facebook:</strong> 1200×630 页面封面</div>
                  <div>• <strong>Twitter:</strong> 1500×500 个人资料</div>
                  <div>• <strong>LinkedIn:</strong> 1584×396 个人资料</div>
                  <div>• <strong>Instagram:</strong> 1080×1080 帖子</div>
                  <div>• <strong>B站:</strong> 1920×1080 视频封面</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}