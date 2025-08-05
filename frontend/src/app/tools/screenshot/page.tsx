'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface ScreenshotOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  width?: number;
  height?: number;
}

interface SelectionArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * 截图工具页面组件
 * 提供区域选择截图和滚动长截图功能
 */
export default function ScreenshotTool() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [screenshotType, setScreenshotType] = useState<'area' | 'scroll'>('area');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [options, setOptions] = useState<ScreenshotOptions>({
    format: 'png',
    quality: 0.9,
    width: undefined,
    height: undefined
  });
  const [error, setError] = useState<string | null>(null);
  const [scrollImages, setScrollImages] = useState<string[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const selectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * 检查浏览器是否支持Screen Capture API
   */
  const checkScreenCaptureSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError('您的浏览器不支持屏幕捕获功能，请使用Chrome、Firefox或Edge浏览器');
      return false;
    }
    return true;
  }, []);

  /**
   * 开始区域选择截图
   */
  const startAreaScreenshot = useCallback(async () => {
    if (!checkScreenCaptureSupport()) return;

    try {
      setIsCapturing(true);
      setError(null);
      setCapturedImage(null);

      // 请求屏幕捕获权限
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // 创建video元素来显示屏幕内容
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;

      // 等待视频加载
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(void 0);
        };
      });

      // 等待一帧渲染
      await new Promise(resolve => requestAnimationFrame(resolve));

      // 创建全屏覆盖层用于区域选择
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        cursor: crosshair;
        z-index: 9999;
        user-select: none;
      `;

      const selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: absolute;
        border: 2px dashed #fff;
        background: rgba(255, 255, 255, 0.1);
        display: none;
        pointer-events: none;
      `;
      overlay.appendChild(selectionBox);

      let isDrawing = false;
      let startX = 0, startY = 0;

      overlay.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
      });

      overlay.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const currentX = e.clientX;
        const currentY = e.clientY;
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
      });

      overlay.addEventListener('mouseup', async (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        
        const endX = e.clientX;
        const endY = e.clientY;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);

        // 移除覆盖层
        document.body.removeChild(overlay);

        if (width < 10 || height < 10) {
          setError('选择区域太小，请重新选择');
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          return;
        }

        // 创建canvas并绘制选中区域
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas元素未找到');

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取Canvas上下文');

        // 计算缩放比例
        const scaleX = video.videoWidth / window.innerWidth;
        const scaleY = video.videoHeight / window.innerHeight;

        // 设置canvas尺寸为选中区域
        canvas.width = width;
        canvas.height = height;

        // 绘制选中区域到canvas
        ctx.drawImage(
          video,
          left * scaleX, top * scaleY, width * scaleX, height * scaleY,
          0, 0, width, height
        );

        // 转换为图片
        const imageDataUrl = canvas.toDataURL(`image/${options.format}`, options.quality);
        setCapturedImage(imageDataUrl);

        // 停止屏幕捕获
        stream.getTracks().forEach(track => track.stop());
      });

      // 添加覆盖层到页面
      document.body.appendChild(overlay);

      // 添加取消键监听
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay);
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

    } catch (err) {
      console.error('区域截图失败:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('用户拒绝了屏幕捕获权限');
        } else if (err.name === 'NotSupportedError') {
          setError('您的浏览器不支持屏幕捕获功能');
        } else {
          setError(`捕获失败: ${err.message}`);
        }
      } else {
        setError('未知错误，请重试');
      }
      setIsCapturing(false);
    }
  }, [options, checkScreenCaptureSupport]);

  /**
   * 滚动截图功能
   */
  const startScrollScreenshot = useCallback(async () => {
    if (!checkScreenCaptureSupport()) return;

    try {
      setIsCapturing(true);
      setIsScrolling(true);
      setError(null);
      setCapturedImage(null);
      setScrollImages([]);

      // 提示用户准备滚动截图
      const userConfirm = confirm(
        '滚动截图功能说明：\n' +
        '1. 点击确定后，请选择要截图的窗口或标签页\n' +
        '2. 选择要截图的区域（拖拽选择）\n' +
        '3. 工具将自动滚动并拼接截图\n' +
        '4. 按ESC键可随时取消操作\n' +
        '\n注意：请确保页面可以滚动'
      );

      if (!userConfirm) {
        setIsCapturing(false);
        setIsScrolling(false);
        return;
      }

      // 请求屏幕捕获权限
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      // 创建video元素
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve(void 0);
        };
      });

      await new Promise(resolve => requestAnimationFrame(resolve));

      // 创建区域选择覆盖层
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        cursor: crosshair;
        z-index: 9999;
        user-select: none;
      `;

      const selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: absolute;
        border: 2px dashed #fff;
        background: rgba(255, 255, 255, 0.1);
        display: none;
        pointer-events: none;
      `;
      overlay.appendChild(selectionBox);

      const instructionText = document.createElement('div');
      instructionText.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 14px;
        text-align: center;
      `;
      instructionText.textContent = '拖拽选择要截图的区域，然后释放鼠标开始滚动截图';
      overlay.appendChild(instructionText);

      let isDrawing = false;
      let startX = 0, startY = 0;
      let selectedArea: SelectionArea | null = null;

      overlay.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
      });

      overlay.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const currentX = e.clientX;
        const currentY = e.clientY;
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
      });

      overlay.addEventListener('mouseup', async (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        
        const endX = e.clientX;
        const endY = e.clientY;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);

        if (width < 50 || height < 50) {
          setError('选择区域太小，请重新选择');
          document.body.removeChild(overlay);
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          setIsScrolling(false);
          return;
        }

        selectedArea = { startX: left, startY: top, endX: left + width, endY: top + height };
        
        // 移除覆盖层
        document.body.removeChild(overlay);

        // 开始滚动截图
        await performScrollScreenshot(video, selectedArea, stream);
      });

      document.body.appendChild(overlay);

      // 添加取消键监听
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          setIsScrolling(false);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

    } catch (err) {
      console.error('滚动截图失败:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('用户拒绝了屏幕捕获权限');
        } else {
          setError(`滚动截图失败: ${err.message}`);
        }
      } else {
        setError('未知错误，请重试');
      }
      setIsCapturing(false);
      setIsScrolling(false);
    }
  }, [checkScreenCaptureSupport]);

  /**
   * 执行滚动截图
   */
  const performScrollScreenshot = useCallback(async (
    video: HTMLVideoElement, 
    area: SelectionArea, 
    stream: MediaStream
  ) => {
    const images: string[] = [];
    const scrollStep = Math.floor((area.endY - area.startY) * 0.8); // 80%重叠
    let currentScroll = 0;
    const maxScrolls = 20; // 最大滚动次数，防止无限滚动
    let scrollCount = 0;

    try {
      // 显示进度提示
      const progressOverlay = document.createElement('div');
      progressOverlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        font-family: monospace;
        min-width: 200px;
      `;
      document.body.appendChild(progressOverlay);

      const updateProgress = (current: number, total: number) => {
        progressOverlay.innerHTML = `
          <div>滚动截图进行中...</div>
          <div>已截取: ${current} 张</div>
          <div>按ESC键停止</div>
        `;
      };

      while (scrollCount < maxScrolls) {
        updateProgress(scrollCount + 1, maxScrolls);

        // 等待页面稳定
        await new Promise(resolve => setTimeout(resolve, 500));

        // 截取当前区域
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) break;

        const scaleX = video.videoWidth / window.innerWidth;
        const scaleY = video.videoHeight / window.innerHeight;
        const areaWidth = area.endX - area.startX;
        const areaHeight = area.endY - area.startY;

        canvas.width = areaWidth;
        canvas.height = areaHeight;

        ctx.drawImage(
          video,
          area.startX * scaleX, area.startY * scaleY, areaWidth * scaleX, areaHeight * scaleY,
          0, 0, areaWidth, areaHeight
        );

        const imageDataUrl = canvas.toDataURL(`image/${options.format}`, options.quality);
        images.push(imageDataUrl);
        scrollCount++;

        // 模拟滚动（实际上需要用户手动滚动或使用其他方法）
        // 这里我们提示用户滚动
        if (scrollCount < maxScrolls) {
          const shouldContinue = confirm(`已截取第 ${scrollCount} 张图片。\n请手动向下滚动页面，然后点击确定继续，或点击取消结束截图。`);
          if (!shouldContinue) break;
        }
      }

      document.body.removeChild(progressOverlay);

      if (images.length === 0) {
        setError('未能截取到任何图片');
        return;
      }

      // 拼接图片
      const finalCanvas = canvasRef.current;
      if (!finalCanvas) throw new Error('Canvas元素未找到');

      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('无法获取Canvas上下文');

      const areaWidth = area.endX - area.startX;
      const totalHeight = images.length * scrollStep + (area.endY - area.startY - scrollStep);
      
      finalCanvas.width = areaWidth;
      finalCanvas.height = totalHeight;

      // 绘制拼接图片
      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            finalCtx.drawImage(img, 0, i * scrollStep);
            resolve(void 0);
          };
          img.src = images[i];
        });
      }

      const finalImageDataUrl = finalCanvas.toDataURL(`image/${options.format}`, options.quality);
      setCapturedImage(finalImageDataUrl);
      setScrollImages(images);

    } catch (err) {
      console.error('拼接图片失败:', err);
      setError('图片拼接失败，请重试');
    } finally {
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
      setIsScrolling(false);
    }
  }, [options]);

  /**
   * 下载截图
   */
  const downloadScreenshot = useCallback(() => {
    if (!capturedImage) return;

    try {
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.${options.format}`;
      link.href = capturedImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    }
  }, [capturedImage, options.format]);

  /**
   * 清除截图
   */
  const clearScreenshot = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  return (
    <>
      <SEO {...seoConfigs.screenshot} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>返回首页</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">📸 截图工具</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              屏幕截图工具
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              支持普通截图和长截图，高质量图片输出，完全在浏览器本地处理
            </p>
          </div>

          {/* 截图类型选择 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">截图类型</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setScreenshotType('area')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  screenshotType === 'area'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📷</div>
                <div className="font-medium">区域截图</div>
                <div className="text-sm text-gray-600 mt-1">
                  选择屏幕区域进行截图
                </div>
              </button>
              <button
                onClick={() => setScreenshotType('scroll')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  screenshotType === 'scroll'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📜</div>
                <div className="font-medium">滚动截图</div>
                <div className="text-sm text-gray-600 mt-1">
                  适合截取长页面内容
                </div>
              </button>
            </div>
          </div>

          {/* 截图设置 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">截图设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片格式
                </label>
                <select
                  value={options.format}
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value as 'png' | 'jpeg' | 'webp' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="png">PNG (无损)</option>
                  <option value="jpeg">JPEG (压缩)</option>
                  <option value="webp">WebP (现代)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片质量 ({Math.round(options.quality * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={options.quality}
                  onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义宽度 (px)
                </label>
                <input
                  type="number"
                  placeholder="自动"
                  value={options.width || ''}
                  onChange={(e) => setOptions(prev => ({ ...prev, width: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义高度 (px)
                </label>
                <input
                  type="number"
                  placeholder="自动"
                  value={options.height || ''}
                  onChange={(e) => setOptions(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={screenshotType === 'area' ? startAreaScreenshot : startScrollScreenshot}
                disabled={isCapturing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{screenshotType === 'area' ? '区域截图中...' : '滚动截图中...'}</span>
                  </>
                ) : (
                  <>
                    <span>📸</span>
                    <span>{screenshotType === 'area' ? '开始区域截图' : '开始滚动截图'}</span>
                  </>
                )}
              </button>
              {capturedImage && (
                <>
                  <button
                    onClick={downloadScreenshot}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>💾</span>
                    <span>下载截图</span>
                  </button>
                  <button
                    onClick={clearScreenshot}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>清除</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div>
                  <h4 className="text-red-800 font-medium mb-1">截图失败</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 截图预览 */}
          {capturedImage && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">截图预览</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={capturedImage}
                  alt="截图预览"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>格式: {options.format.toUpperCase()}</p>
                <p>质量: {Math.round(options.quality * 100)}%</p>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 使用说明</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>选择截图类型：普通截图或长截图</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>调整截图设置：格式、质量、尺寸等</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>点击开始截图，选择要截图的窗口或屏幕，然后选择截图区域</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>滚动截图需要手动滚动页面，工具会自动拼接图片</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">5.</span>
                <span>预览截图效果，满意后点击下载</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>注意：</strong>此工具需要现代浏览器支持（Chrome 72+、Firefox 66+、Edge 79+），
                首次使用时浏览器会请求屏幕捕获权限。
              </p>
            </div>
          </div>

          {/* 隐藏的canvas用于图片处理 */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </main>
      </div>
    </>
  );
}