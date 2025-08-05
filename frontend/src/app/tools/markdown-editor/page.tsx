'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface MarkdownEditorState {
  content: string;
  previewHtml: string;
  wordCount: number;
  charCount: number;
  readingTime: number;
  isDarkMode: boolean;
  isPreviewMode: boolean;
  isSplitView: boolean;
}

/**
 * Markdown编辑器组件
 * 提供实时预览、语法高亮、导出等功能
 */
export default function MarkdownEditor() {
  const [state, setState] = useState<MarkdownEditorState>({
    content: '# 欢迎使用 Markdown 编辑器\n\n开始编写你的文档...',
    previewHtml: '',
    wordCount: 0,
    charCount: 0,
    readingTime: 0,
    isDarkMode: false,
    isPreviewMode: false,
    isSplitView: true
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  /**
   * 将Markdown转换为HTML
   * @param markdown Markdown文本
   * @returns HTML字符串
   */
  const markdownToHtml = (markdown: string): string => {
    let html = markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // 列表
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      // 换行
      .replace(/\n/g, '<br>');
    
    // 包装列表项
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    return html;
  };

  /**
   * 计算文本统计信息
   * @param text 文本内容
   */
  const calculateStats = (text: string) => {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    const readingTime = Math.ceil(wordCount / 200); // 假设每分钟阅读200字
    
    return { wordCount, charCount, readingTime };
  };

  /**
   * 处理内容变化
   */
  const handleContentChange = (newContent: string) => {
    const stats = calculateStats(newContent);
    const previewHtml = markdownToHtml(newContent);
    
    setState(prev => ({
      ...prev,
      content: newContent,
      previewHtml,
      ...stats
    }));
    
    // 保存到本地存储
    localStorage.setItem('markdown-editor-content', newContent);
  };

  /**
   * 导出为HTML文件
   */
  const exportAsHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown文档</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        a { color: #0066cc; }
        ul { padding-left: 20px; }
    </style>
</head>
<body>
    ${state.previewHtml}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 导出为Markdown文件
   */
  const exportAsMarkdown = () => {
    const blob = new Blob([state.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 导出为PDF文件
   */
  const exportAsPdf = async () => {
    try {
      // 动态导入jsPDF
      const { jsPDF } = await import('jspdf');
      
      // 创建PDF实例
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 设置字体（支持中文）
      pdf.setFont('helvetica');
      pdf.setFontSize(12);
      
      // 页面设置
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      const maxWidth = pageWidth - 2 * margin;
      
      let yPosition = margin;
      
      // 将Markdown转换为纯文本（简化处理）
      const plainText = state.content
        .replace(/#{1,6}\s+/g, '') // 移除标题标记
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
        .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
        .replace(/`(.*?)`/g, '$1') // 移除代码标记
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
        .replace(/^[-*+]\s+/gm, '• ') // 转换列表项
        .replace(/^\d+\.\s+/gm, '• '); // 转换有序列表
      
      // 分割文本为行
      const lines = plainText.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') {
          yPosition += lineHeight / 2;
          continue;
        }
        
        // 处理长行，自动换行
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = pdf.getTextWidth(testLine);
          
          if (textWidth > maxWidth && currentLine !== '') {
            // 检查是否需要新页面
            if (yPosition + lineHeight > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.text(currentLine, margin, yPosition);
            yPosition += lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // 输出最后一行
        if (currentLine) {
          // 检查是否需要新页面
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.text(currentLine, margin, yPosition);
          yPosition += lineHeight;
        }
        
        yPosition += 2; // 行间距
      }
      
      // 保存PDF
      pdf.save('document.pdf');
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请稍后重试');
    }
  };

  /**
   * 插入Markdown语法
   */
  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = state.content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    let newContent;
    if (syntax.includes('$TEXT$')) {
      newContent = state.content.substring(0, start) + 
                   syntax.replace('$TEXT$', textToInsert) + 
                   state.content.substring(end);
    } else {
      newContent = state.content.substring(0, start) + 
                   syntax + textToInsert + syntax + 
                   state.content.substring(end);
    }
    
    handleContentChange(newContent);
    
    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + syntax.length + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 从本地存储加载内容
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-editor-content');
    if (savedContent) {
      handleContentChange(savedContent);
    } else {
      handleContentChange(state.content);
    }
  }, []);

  return (
    <>
      <SEO {...seoConfigs.markdownEditor} />
      <div className={`min-h-screen ${state.isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* 导航栏 */}
        <nav className={`${state.isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700">
                  ← 返回首页
                </Link>
                <h1 className={`text-xl font-bold ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📝 Markdown 编辑器
                </h1>
              </div>
              
              {/* 工具栏 */}
              <div className="flex items-center space-x-2">
                {/* 视图切换 */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setState(prev => ({ ...prev, isSplitView: true, isPreviewMode: false }))}
                    className={`px-3 py-1 text-sm rounded ${state.isSplitView ? 'bg-white shadow-sm' : ''}`}
                  >
                    分屏
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, isSplitView: false, isPreviewMode: false }))}
                    className={`px-3 py-1 text-sm rounded ${!state.isSplitView && !state.isPreviewMode ? 'bg-white shadow-sm' : ''}`}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, isSplitView: false, isPreviewMode: true }))}
                    className={`px-3 py-1 text-sm rounded ${state.isPreviewMode ? 'bg-white shadow-sm' : ''}`}
                  >
                    预览
                  </button>
                </div>
                
                {/* 导出按钮 */}
                <button
                  onClick={exportAsMarkdown}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  导出 MD
                </button>
                <button
                  onClick={exportAsHtml}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  导出 HTML
                </button>
                <button
                  onClick={exportAsPdf}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  导出 PDF
                </button>
                
                {/* 主题切换 */}
                <button
                  onClick={() => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))}
                  className={`p-2 rounded ${state.isDarkMode ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  {state.isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 工具栏 */}
        <div className={`${state.isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2`}>
          <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm">
            <button
              onClick={() => insertMarkdown('**', '粗体文本')}
              className="px-2 py-1 rounded hover:bg-gray-100 font-bold"
            >
              B
            </button>
            <button
              onClick={() => insertMarkdown('*', '斜体文本')}
              className="px-2 py-1 rounded hover:bg-gray-100 italic"
            >
              I
            </button>
            <button
              onClick={() => insertMarkdown('`', '代码')}
              className="px-2 py-1 rounded hover:bg-gray-100 font-mono"
            >
              Code
            </button>
            <button
              onClick={() => insertMarkdown('[链接文本](', 'https://example.com)')}
              className="px-2 py-1 rounded hover:bg-gray-100"
            >
              🔗
            </button>
            <button
              onClick={() => insertMarkdown('# ', '')}
              className="px-2 py-1 rounded hover:bg-gray-100"
            >
              H1
            </button>
            <button
              onClick={() => insertMarkdown('## ', '')}
              className="px-2 py-1 rounded hover:bg-gray-100"
            >
              H2
            </button>
            <button
              onClick={() => insertMarkdown('- ', '')}
              className="px-2 py-1 rounded hover:bg-gray-100"
            >
              列表
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto p-4">
          <div className={`grid ${state.isSplitView ? 'grid-cols-2' : 'grid-cols-1'} gap-4 h-[calc(100vh-200px)]`}>
            {/* 编辑器 */}
            {(!state.isPreviewMode || state.isSplitView) && (
              <div className={`${state.isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${state.isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                <div className={`${state.isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'} px-4 py-2 border-b ${state.isDarkMode ? 'border-gray-600' : 'border-gray-200'} text-sm`}>
                  编辑器
                </div>
                <textarea
                  ref={textareaRef}
                  value={state.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`w-full h-full p-4 resize-none outline-none font-mono text-sm leading-relaxed ${
                    state.isDarkMode 
                      ? 'bg-gray-800 text-gray-100 placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="在这里输入 Markdown 内容..."
                  spellCheck={false}
                />
              </div>
            )}

            {/* 预览区域 */}
            {(state.isPreviewMode || state.isSplitView) && (
              <div className={`${state.isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${state.isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                <div className={`${state.isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-700'} px-4 py-2 border-b ${state.isDarkMode ? 'border-gray-600' : 'border-gray-200'} text-sm`}>
                  预览
                </div>
                <div
                  ref={previewRef}
                  className={`h-full p-4 overflow-y-auto prose max-w-none ${
                    state.isDarkMode ? 'prose-invert text-gray-100' : 'text-gray-900'
                  }`}
                  dangerouslySetInnerHTML={{ __html: state.previewHtml }}
                />
              </div>
            )}
          </div>

          {/* 状态栏 */}
          <div className={`mt-4 ${state.isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} rounded-lg border ${state.isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-2`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span>字数: {state.wordCount}</span>
                <span>字符: {state.charCount}</span>
                <span>预计阅读: {state.readingTime} 分钟</span>
              </div>
              <div className="text-xs text-gray-500">
                自动保存已启用
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}