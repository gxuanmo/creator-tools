'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

/**
 * 通用布局组件
 * 为所有页面提供统一的导航栏和页脚
 */
export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: '首页',
      href: '/',
      icon: '🏠'
    },
    {
      name: '图片压缩器',
      href: '/tools/image-compressor',
      icon: '🖼️'
    },
    {
      name: '标题生成器',
      href: '/tools/headline-generator',
      icon: '✍️'
    },
    {
      name: 'YouTube缩略图下载器',
      href: '/tools/thumbnail-downloader',
      icon: '📺'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-xl font-bold text-gray-900">
                🛠️ Creator Tools
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v2.0
              </span>
            </Link>

            {/* 导航菜单 */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  if (menu) {
                    menu.classList.toggle('hidden');
                  }
                }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* 移动端菜单 */}
          <div id="mobile-menu" className="hidden md:hidden pb-4">
            <div className="space-y-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      const menu = document.getElementById('mobile-menu');
                      if (menu) {
                        menu.classList.add('hidden');
                      }
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 Creator Tools-创作者工具箱
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a 
                href="https://github.com" 
                className="hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a 
                href="#" 
                className="hover:text-gray-900 transition-colors"
              >
                文档
              </a>
              <a 
                href="#" 
                className="hover:text-gray-900 transition-colors"
              >
                反馈
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}