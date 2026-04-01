'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SEO, { seoConfigs } from '@/components/SEO';
import Workspace from '@/components/Workspace';
import ToolSearch from '@/components/ToolSearch';
import ShortcutHelp from '@/components/ShortcutHelp';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

// 添加自定义CSS样式
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float 6s ease-in-out infinite;
    animation-delay: 2s;
  }
  
  .animate-float-delayed-2 {
    animation: float 6s ease-in-out infinite;
    animation-delay: 4s;
  }
`;

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  keywords?: string[];
}

/**
 * 主页组件
 * 展示所有可用的创作者工具
 */
export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const { addToHistory } = useWorkspace();
  
  // 注册快捷键
  const { registerShortcut } = useKeyboardShortcuts();
  
  useEffect(() => {
    // 注册全局快捷键
    const unregisterOpenWorkspace = registerShortcut({
      ...DEFAULT_SHORTCUTS.OPEN_WORKSPACE,
      action: () => setShowWorkspace(true)
    });
    
    const unregisterSearchTools = registerShortcut({
      ...DEFAULT_SHORTCUTS.SEARCH_TOOLS,
      action: () => setShowSearch(true)
    });
    
    const unregisterShowHelp = registerShortcut({
      ...DEFAULT_SHORTCUTS.HELP,
      action: () => setShowShortcutHelp(true)
    });
    
    return () => {
      unregisterOpenWorkspace();
      unregisterSearchTools();
      unregisterShowHelp();
    };
  }, [registerShortcut]);
  
  // 处理工具点击
  const handleToolClick = (tool: Tool) => {
    addToHistory({
      id: tool.id,
      name: tool.name,
      href: tool.href,
      icon: tool.icon,
    });
  };
  const tools: Tool[] = [
    {
      id: 'image-compressor',
      name: '图片压缩器',
      description: '批量压缩图片，减小文件大小，保持画质',
      icon: '🖼️',
      href: '/tools/image-compressor',
      color: 'bg-blue-500',
      keywords: ['图片', '压缩', '批量', '文件大小', 'image', 'compress', 'batch']
    },
    {
      id: 'headline-generator',
      name: '标题生成器',
      description: '基于关键词和模板，快速生成吸引人的标题',
      icon: '✍️',
      href: '/tools/headline-generator',
      color: 'bg-green-500',
      keywords: ['标题', '生成', '关键词', '模板', 'headline', 'generator', 'title']
    },
    {
      id: 'thumbnail-downloader',
      name: 'YouTube缩略图下载器',
      description: '快速下载YouTube视频的高质量缩略图',
      icon: '📺',
      href: '/tools/thumbnail-downloader',
      color: 'bg-red-500',
      keywords: ['YouTube', '缩略图', '下载', '视频', 'thumbnail', 'download']
    },
    {
      id: 'word-counter',
      name: '字数统计器',
      description: '实时统计文本字数、分析可读性和关键词密度',
      icon: '📊',
      href: '/tools/word-counter',
      color: 'bg-purple-500',
      keywords: ['字数', '统计', '文本', '可读性', '关键词密度', 'word', 'counter', 'text']
    },
    {
      id: 'image-converter',
      name: '图片格式转换器',
      description: '支持JPG、PNG、WebP格式互转，批量处理',
      icon: '🔄',
      href: '/tools/image-converter',
      color: 'bg-orange-500',
      keywords: ['图片', '转换', '格式', 'JPG', 'PNG', 'WebP', '批量', 'image', 'convert']
    },
    {
      id: 'qr-generator',
      name: '二维码生成器',
      description: '支持文本、URL、WiFi、联系人等多种类型，自定义样式，一键生成高质量二维码',
      icon: '📱',
      href: '/tools/qr-generator',
      color: 'bg-indigo-500',
      keywords: ['二维码', 'QR', '生成', '文本', 'URL', 'WiFi', '联系人', 'qrcode', 'generator']
    },
    {
      id: 'color-tools',
      name: '色彩工具箱',
      description: '专业颜色工具集合，颜色转换、调色板生成、图片取色，设计师必备',
      icon: '🎨',
      href: '/tools/color-tools',
      color: 'bg-pink-500',
      keywords: ['颜色', '色彩', '调色板', '取色', '设计', 'color', 'palette', 'picker']
    },
    {
      id: 'markdown-editor',
      name: 'Markdown编辑器',
      description: '专业Markdown编辑器，实时预览、语法高亮、多格式导出',
      icon: '📝',
      href: '/tools/markdown-editor',
      color: 'bg-teal-500',
      keywords: ['Markdown', '编辑器', '预览', '语法高亮', '导出', 'editor', 'md']
    },
    {
      id: 'text-tools',
      name: '文本工具集',
      description: '全面的文本处理工具，格式转换、编码解码、正则测试',
      icon: '🛠️',
      href: '/tools/text-tools',
      color: 'bg-cyan-500',
      keywords: ['文本', '处理', '格式转换', '编码', '解码', '正则', 'text', 'tools']
    },
    {
      id: 'screenshot',
      name: '截图工具',
      description: '屏幕截图和长截图工具，支持多种格式，高质量输出',
      icon: '📸',
      href: '/tools/screenshot',
      color: 'bg-violet-500',
      keywords: ['截图', '屏幕', '长截图', '格式', 'screenshot', 'capture']
    },
    {
      id: 'document-converter',
      name: '文档格式转换器',
      description: 'Markdown与PDF/Word格式互转，支持自定义样式和布局',
      icon: '📄',
      href: '/tools/document-converter',
      color: 'bg-amber-500',
      keywords: ['文档', '转换', 'Markdown', 'PDF', 'Word', '样式', 'document', 'convert']
    },
    {
      id: 'social-cover-generator',
      name: '社交媒体封面生成器',
      description: '为YouTube、Facebook、Twitter等平台生成专业封面',
      icon: '🎨',
      href: '/tools/social-cover-generator',
      color: 'bg-pink-500',
      keywords: ['社交', '媒体', '封面', '生成', 'YouTube', 'Facebook', 'Twitter', 'social', 'cover']
    },
    {
      id: 'voice-generator',
      name: '配音工具 (TTS)',
      description: '文本转语音工具，支持多语言和语音参数调节',
      icon: '🎤',
      href: '/tools/voice-generator',
      color: 'bg-blue-500',
      keywords: ['配音', 'TTS', '语音', '文本转语音', '多语言', 'voice', 'speech']
    },
    {
      id: 'content-extractor',
      name: '内容提取工具',
      description: '从网页、文档中提取文本、图片、链接等内容',
      icon: '🔍',
      href: '/tools/content-extractor',
      color: 'bg-teal-500',
      keywords: ['内容', '提取', '网页', '文档', '文本', '图片', '链接', 'extract', 'content']
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <SEO {...seoConfigs.home} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed-2"></div>
        </div>
        
        {/* 导航栏 */}
        <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🛠️ Creator Tools
                </div>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                  v2.0
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-200"
                  title="搜索工具 (Ctrl+K)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>搜索</span>
                </button>
                <button
                  onClick={() => setShowWorkspace(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-200"
                  title="工作空间 (Ctrl+W)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>工作空间</span>
                </button>
                <button
                  onClick={() => setShowShortcutHelp(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-200"
                  title="快捷键帮助 (Ctrl+?)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>帮助</span>
                </button>
                <div className="text-sm text-gray-500 hidden lg:block">
                  隐私优先 · 无需登录 · 完全免费
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          {/* 页面标题 */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
                ✨ 全新升级 v2.0
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
              创作者工具集
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              为内容创作者打造的专业工具平台，让创作更高效、更简单
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-8">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <span className="text-green-400">✓</span>
                <span>完全免费</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <span className="text-green-400">✓</span>
                <span>无需注册</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <span className="text-green-400">✓</span>
                <span>隐私保护</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
                <span className="text-green-400">✓</span>
                <span>开源项目</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowSearch(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🚀 开始使用
              </button>
              <button 
                onClick={() => setShowWorkspace(true)}
                className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-white transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                📊 查看工作空间
              </button>
            </div>
          </div>

          {/* 工具卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {tools.map((tool, index) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group block"
                onClick={() => handleToolClick(tool)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:bg-white hover:border-gray-300 hover:-translate-y-2 hover:shadow-2xl group animate-fade-in-up">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 backdrop-blur-sm rounded-xl p-4 text-3xl flex-shrink-0 border border-gray-200 group-hover:scale-110 transition-transform duration-300">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                      <span>立即使用</span>
                      <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 特性介绍 */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              为什么选择 Creator Tools？
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔒</div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">隐私优先</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  所有处理都在浏览器本地完成，不上传任何数据到服务器
                </p>
              </div>
              <div className="text-center group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">快速高效</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  优化的算法和界面设计，让你的创作流程更加顺畅
                </p>
              </div>
              <div className="text-center group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">专为创作者</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  针对内容创作者的实际需求设计，解决真实痛点
                </p>
              </div>
              <div className="text-center group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🆓</div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">完全免费</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  开源项目，永久免费使用，无任何隐藏费用
                </p>
              </div>
            </div>
          </div>

          {/* 使用统计 */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 backdrop-blur-md rounded-2xl border border-gray-200 text-gray-800 p-8 text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">
              🚀 已服务全球创作者
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">15,000+</div>
                <div className="text-gray-600 text-sm">图片已处理</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">8,000+</div>
                <div className="text-gray-600 text-sm">标题已生成</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">12,000+</div>
                <div className="text-gray-600 text-sm">缩略图已下载</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">5,200+</div>
                <div className="text-gray-600 text-sm">文本已分析</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">3,800+</div>
                <div className="text-gray-600 text-sm">格式已转换</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">2,100+</div>
                <div className="text-gray-600 text-sm">二维码已生成</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">1,800+</div>
                <div className="text-gray-600 text-sm">色彩工具使用</div>
              </div>
            </div>
            <div className="mt-8 text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              🎉 新增Markdown编辑器、文本工具集、截图工具、字数统计器、图片格式转换器、二维码生成器和色彩工具箱
            </div>
          </div>
        </main>

      {/* 工作空间弹窗 */}
      {showWorkspace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">工作空间</h2>
                <button
                  onClick={() => setShowWorkspace(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <Workspace isOpen={showWorkspace} onClose={() => setShowWorkspace(false)} />
            </div>
          </div>
        </div>
      )}

      {/* 搜索弹窗 */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <ToolSearch
              isOpen={showSearch}
              onClose={() => setShowSearch(false)}
              tools={tools}
            />
          </div>
        </div>
      )}

      {/* 快捷键帮助弹窗 */}
      {showShortcutHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <ShortcutHelp
              isOpen={showShortcutHelp}
              onClose={() => setShowShortcutHelp(false)}
            />
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            © 2025 Creator Tools-创作者工具箱
          </p>
          <div className="flex justify-center space-x-8">
            <a
              href="https://github.com/creator-tools/creator-tools"
              className="text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110 flex items-center space-x-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>🔗</span>
              <span>GitHub</span>
            </a>
            <a
              href="/docs"
              className="text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110 flex items-center space-x-2"
            >
              <span>📚</span>
              <span>文档</span>
            </a>
            <a
              href="/feedback"
              className="text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110 flex items-center space-x-2"
            >
              <span>💬</span>
              <span>反馈</span>
            </a>
          </div>
          <div className="mt-8 text-gray-500 text-sm">
            <p>🚀 让创作更简单，让工具更智能</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
