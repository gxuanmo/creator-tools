'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  keywords?: string[];
}

interface ToolSearchProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
}

export default function ToolSearch({ isOpen, onClose, tools }: ToolSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 搜索逻辑
  useEffect(() => {
    if (!query.trim()) {
      setFilteredTools(tools.slice(0, 8)); // 显示前8个工具
      setSelectedIndex(0);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const results = tools.filter(tool => {
      // 确保必要的属性存在
      if (!tool.name || !tool.description) {
        return false;
      }
      
      // 搜索名称
      if (tool.name.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // 搜索描述
      if (tool.description.toLowerCase().includes(searchQuery)) {
        return true;
      }
      
      // 搜索关键词
      if (tool.keywords && tool.keywords.some(keyword => 
        keyword && keyword.toLowerCase().includes(searchQuery)
      )) {
        return true;
      }
      
      // 模糊搜索（拼音首字母等）
      const nameChars = tool.name.split('');
      const queryChars = searchQuery.split('');
      let queryIndex = 0;
      
      for (const char of nameChars) {
        if (queryIndex < queryChars.length && 
            char.toLowerCase() === queryChars[queryIndex]) {
          queryIndex++;
        }
      }
      
      return queryIndex === queryChars.length;
    });

    // 按相关性排序
    results.sort((a, b) => {
      const aNameMatch = a.name && a.name.toLowerCase().includes(searchQuery);
      const bNameMatch = b.name && b.name.toLowerCase().includes(searchQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // 按名称长度排序（更短的更相关）
      return (a.name?.length || 0) - (b.name?.length || 0);
    });

    setFilteredTools(results.slice(0, 8));
    setSelectedIndex(0);
  }, [query, tools]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTools.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTools.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTools[selectedIndex]) {
            router.push(filteredTools[selectedIndex].href);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, router, onClose]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToolClick = (tool: Tool) => {
    router.push(tool.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[10vh] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
        {/* 搜索输入框 */}
        <div className="p-4 border-b">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具..."
              className="w-full pl-10 pr-4 py-3 text-lg border-0 focus:outline-none focus:ring-0"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg mb-2">
                {query ? '没有找到匹配的工具' : '开始输入以搜索工具'}
              </p>
              {query && (
                <p className="text-sm">
                  尝试使用不同的关键词或检查拼写
                </p>
              )}
            </div>
          ) : (
            <div className="py-2">
              {filteredTools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {highlightMatch(tool.name, query)}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {highlightMatch(tool.description, query)}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {filteredTools.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs mr-1">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs mr-1">Enter</kbd>
                选择
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs mr-1">Esc</kbd>
                关闭
              </span>
            </div>
            <span>
              {filteredTools.length} 个结果
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// 高亮匹配文本的辅助函数
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!text || !query.trim()) return text || '';
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}