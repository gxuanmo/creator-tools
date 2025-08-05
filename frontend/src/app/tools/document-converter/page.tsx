'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface ConversionOptions {
  format: 'pdf' | 'docx' | 'md';
  pageSize: 'A4' | 'Letter';
  fontSize: number;
  margin: number;
}

interface ConversionResult {
  fileName: string;
  downloadUrl: string;
  fileSize: string;
}

/**
 * 文档格式转换器页面组件
 * 支持Markdown与PDF/Word格式的相互转换
 */
export default function DocumentConverter() {
  const [inputContent, setInputContent] = useState('');
  const [inputFormat, setInputFormat] = useState<'md' | 'pdf' | 'docx'>('md');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'docx' | 'md'>('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    format: 'pdf',
    pageSize: 'A4',
    fontSize: 12,
    margin: 20
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const text = await file.text();
      setInputContent(text);
      
      // 根据文件扩展名设置输入格式
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'md' || extension === 'markdown') {
        setInputFormat('md');
      } else if (extension === 'pdf') {
        setInputFormat('pdf');
      } else if (extension === 'docx' || extension === 'doc') {
        setInputFormat('docx');
      }
    } catch (err) {
      setError('文件读取失败，请检查文件格式');
    }
  }, []);

  /**
   * Markdown转PDF
   */
  const convertMarkdownToPdf = useCallback(async (content: string): Promise<string> => {
    // 动态导入jsPDF
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: options.pageSize.toLowerCase() as 'a4' | 'letter'
    });

    // 设置字体和大小
    doc.setFontSize(options.fontSize);
    
    // 处理Markdown内容
    const lines = content.split('\n');
    let yPosition = options.margin;
    const lineHeight = options.fontSize * 0.5;
    const pageHeight = options.pageSize === 'A4' ? 297 : 279;
    const maxWidth = options.pageSize === 'A4' ? 170 : 190;

    for (const line of lines) {
      // 检查是否需要换页
      if (yPosition > pageHeight - options.margin) {
        doc.addPage();
        yPosition = options.margin;
      }

      // 处理标题
      if (line.startsWith('# ')) {
        doc.setFontSize(options.fontSize + 6);
        doc.text(line.substring(2), options.margin, yPosition);
        doc.setFontSize(options.fontSize);
      } else if (line.startsWith('## ')) {
        doc.setFontSize(options.fontSize + 4);
        doc.text(line.substring(3), options.margin, yPosition);
        doc.setFontSize(options.fontSize);
      } else if (line.startsWith('### ')) {
        doc.setFontSize(options.fontSize + 2);
        doc.text(line.substring(4), options.margin, yPosition);
        doc.setFontSize(options.fontSize);
      } else {
        // 处理普通文本，支持自动换行
        const cleanText = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        const splitText = doc.splitTextToSize(cleanText, maxWidth);
        doc.text(splitText, options.margin, yPosition);
        yPosition += (splitText.length - 1) * lineHeight;
      }
      
      yPosition += lineHeight + 2;
    }

    return doc.output('datauristring');
  }, [options]);

  /**
   * Markdown转Word (简化版，生成HTML格式)
   */
  const convertMarkdownToWord = useCallback(async (content: string): Promise<string> => {
    // 简单的Markdown到HTML转换
    let html = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    // 创建Word文档的HTML结构
    const wordHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Document</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: ${options.fontSize}pt; margin: ${options.margin}mm; }
          h1 { font-size: ${options.fontSize + 6}pt; }
          h2 { font-size: ${options.fontSize + 4}pt; }
          h3 { font-size: ${options.fontSize + 2}pt; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // 转换为Blob URL
    const blob = new Blob([wordHtml], { type: 'application/msword' });
    return URL.createObjectURL(blob);
  }, [options]);

  /**
   * 执行格式转换
   */
  const handleConvert = useCallback(async () => {
    if (!inputContent.trim()) {
      setError('请输入要转换的内容或上传文件');
      return;
    }

    try {
      setIsConverting(true);
      setError(null);
      setConversionResult(null);

      let downloadUrl = '';
      let fileName = '';
      let fileSize = '';

      if (inputFormat === 'md' && outputFormat === 'pdf') {
        downloadUrl = await convertMarkdownToPdf(inputContent);
        fileName = 'document.pdf';
      } else if (inputFormat === 'md' && outputFormat === 'docx') {
        downloadUrl = await convertMarkdownToWord(inputContent);
        fileName = 'document.doc';
      } else if (outputFormat === 'md') {
        // 其他格式转Markdown（简化处理）
        const blob = new Blob([inputContent], { type: 'text/markdown' });
        downloadUrl = URL.createObjectURL(blob);
        fileName = 'document.md';
      } else {
        throw new Error('不支持的转换格式');
      }

      // 计算文件大小
      const blob = await fetch(downloadUrl).then(r => r.blob());
      fileSize = (blob.size / 1024).toFixed(2) + ' KB';

      setConversionResult({
        fileName,
        downloadUrl,
        fileSize
      });

    } catch (err) {
      console.error('转换失败:', err);
      setError(err instanceof Error ? err.message : '转换失败，请重试');
    } finally {
      setIsConverting(false);
    }
  }, [inputContent, inputFormat, outputFormat, convertMarkdownToPdf, convertMarkdownToWord]);

  /**
   * 下载转换后的文件
   */
  const handleDownload = useCallback(() => {
    if (!conversionResult) return;

    const link = document.createElement('a');
    link.href = conversionResult.downloadUrl;
    link.download = conversionResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [conversionResult]);

  /**
   * 清空内容
   */
  const handleClear = useCallback(() => {
    setInputContent('');
    setConversionResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <>
      <SEO {...seoConfigs.documentConverter} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <span className="text-xl">←</span>
                <span>返回首页</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">文档格式转换器</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 格式选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入格式
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value as 'md' | 'pdf' | 'docx')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="md">Markdown (.md)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出格式
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    const format = e.target.value as 'pdf' | 'docx' | 'md';
                    setOutputFormat(format);
                    setOptions(prev => ({ ...prev, format }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="md">Markdown (.md)</option>
                </select>
              </div>
            </div>

            {/* 转换选项 */}
            {(outputFormat === 'pdf' || outputFormat === 'docx') && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">转换选项</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">页面大小</label>
                    <select
                      value={options.pageSize}
                      onChange={(e) => setOptions(prev => ({ ...prev, pageSize: e.target.value as 'A4' | 'Letter' }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">字体大小 (pt)</label>
                    <input
                      type="number"
                      min="8"
                      max="24"
                      value={options.fontSize}
                      onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">页边距 (mm)</label>
                    <input
                      type="number"
                      min="10"
                      max="50"
                      value={options.margin}
                      onChange={(e) => setOptions(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 文件上传 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传文件 (可选)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 内容输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文档内容
              </label>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={inputFormat === 'md' ? '请输入Markdown内容...' : '请输入文档内容或上传文件...'}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleConvert}
                disabled={isConverting || !inputContent.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>转换中...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>开始转换</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                清空内容
              </button>
            </div>

            {/* 转换结果 */}
            {conversionResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-800 mb-4">转换完成</h3>
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
                  <div>
                    <p className="font-medium text-gray-900">{conversionResult.fileName}</p>
                    <p className="text-sm text-gray-600">文件大小: {conversionResult.fileSize}</p>
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
          </div>

          {/* 使用说明 */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>选择输入和输出格式</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>上传文件或直接在文本框中输入内容</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>调整转换选项（如页面大小、字体大小等）</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>点击"开始转换"按钮</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">5.</span>
                <span>转换完成后点击下载按钮保存文件</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">支持的格式</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Markdown:</strong> 支持标题、粗体、斜体等基本语法</li>
                <li>• <strong>PDF:</strong> 高质量PDF文档，支持自定义页面设置</li>
                <li>• <strong>Word:</strong> 兼容Microsoft Word的HTML格式</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}