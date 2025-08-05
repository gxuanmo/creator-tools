'use client';

import { useState, useRef, useCallback } from 'react';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';
import JSZip from 'jszip';

interface ConvertedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  convertedUrl: string;
  originalFormat: string;
  targetFormat: string;
  originalSize: number;
  convertedSize: number;
  quality: number;
}

type ImageFormat = 'jpeg' | 'png' | 'webp';

/**
 * 图片格式转换器页面
 * 支持JPG/PNG/WebP格式互转，批量处理和质量调节
 */
export default function ImageConverterPage() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 获取文件的格式
   */
  const getImageFormat = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      default:
        return 'unknown';
    }
  };

  /**
   * 转换单个图片
   */
  const convertImage = useCallback(async (file: File, format: ImageFormat, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 如果目标格式是JPEG，先填充白色背景
        if (format === 'jpeg') {
          ctx!.fillStyle = '#FFFFFF';
          ctx!.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx!.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('转换失败'));
            }
          },
          `image/${format}`,
          format === 'png' ? undefined : quality
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const format = getImageFormat(file);
      return ['jpeg', 'png', 'webp'].includes(format) && file.size <= 10 * 1024 * 1024; // 10MB限制
    });

    if (validFiles.length === 0) {
      toast.error('请选择有效的图片文件（JPG/PNG/WebP，小于10MB）');
      return;
    }

    if (validFiles.length !== files.length) {
      toast.info(`已过滤 ${files.length - validFiles.length} 个无效文件`);
    }

    setIsConverting(true);
    const newImages: ConvertedImage[] = [];

    try {
      for (const file of validFiles) {
        const originalFormat = getImageFormat(file);
        
        // 如果原格式和目标格式相同，跳过转换
        if (originalFormat === targetFormat) {
          const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const originalUrl = URL.createObjectURL(file);
          
          newImages.push({
            id,
            originalFile: file,
            originalUrl,
            convertedUrl: originalUrl,
            originalFormat,
            targetFormat,
            originalSize: file.size,
            convertedSize: file.size,
            quality: 1
          });
          continue;
        }

        const convertedBlob = await convertImage(file, targetFormat, quality);
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const originalUrl = URL.createObjectURL(file);
        const convertedUrl = URL.createObjectURL(convertedBlob);
        
        newImages.push({
          id,
          originalFile: file,
          originalUrl,
          convertedUrl,
          originalFormat,
          targetFormat,
          originalSize: file.size,
          convertedSize: convertedBlob.size,
          quality
        });
      }
      
      setImages(prev => [...prev, ...newImages]);
      toast.success(`成功转换 ${newImages.length} 张图片`);
    } catch (error) {
      console.error('转换失败:', error);
      toast.error('转换过程中出现错误');
    } finally {
      setIsConverting(false);
    }
  }, [targetFormat, quality, convertImage]);

  /**
   * 处理拖拽上传
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  /**
   * 处理文件输入
   */
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  }, [handleFileSelect]);

  /**
   * 下载单个图片
   */
  const downloadImage = useCallback((image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.convertedUrl;
    const extension = image.targetFormat === 'jpeg' ? 'jpg' : image.targetFormat;
    const baseName = image.originalFile.name.split('.').slice(0, -1).join('.');
    link.download = `${baseName}_converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('图片下载已开始');
  }, []);

  /**
   * 批量下载所有图片
   */
  const downloadAllImages = useCallback(async () => {
    if (images.length === 0) {
      toast.error('没有可下载的图片');
      return;
    }

    if (images.length === 1) {
      downloadImage(images[0]);
      return;
    }

    try {
      const zip = new JSZip();
      
      for (const image of images) {
        const response = await fetch(image.convertedUrl);
        const blob = await response.blob();
        const extension = image.targetFormat === 'jpeg' ? 'jpg' : image.targetFormat;
        const baseName = image.originalFile.name.split('.').slice(0, -1).join('.');
        const fileName = `${baseName}_converted.${extension}`;
        zip.file(fileName, blob);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `converted_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('批量下载已开始');
    } catch (error) {
      console.error('批量下载失败:', error);
      toast.error('批量下载失败');
    }
  }, [images, downloadImage]);

  /**
   * 清空所有图片
   */
  const clearAllImages = useCallback(() => {
    // 释放所有URL对象
    images.forEach(image => {
      URL.revokeObjectURL(image.originalUrl);
      if (image.convertedUrl !== image.originalUrl) {
        URL.revokeObjectURL(image.convertedUrl);
      }
    });
    
    setImages([]);
    toast.info('已清空所有图片');
  }, [images]);

  /**
   * 删除单个图片
   */
  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.originalUrl);
        if (imageToRemove.convertedUrl !== imageToRemove.originalUrl) {
          URL.revokeObjectURL(imageToRemove.convertedUrl);
        }
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  /**
   * 计算总体统计
   */
  const totalStats = {
    originalSize: images.reduce((sum, img) => sum + img.originalSize, 0),
    convertedSize: images.reduce((sum, img) => sum + img.convertedSize, 0),
    count: images.length
  };

  const compressionRatio = totalStats.originalSize > 0 
    ? Math.round((1 - totalStats.convertedSize / totalStats.originalSize) * 100)
    : 0;

  return (
    <Layout>
      <SEO 
        title="图片格式转换器 - Creator Tools"
        description="在线图片格式转换工具，支持JPG、PNG、WebP格式互转，批量处理，质量调节，完全免费"
        keywords={['图片格式转换', 'JPG转PNG', 'PNG转WebP', '图片转换', '批量转换']}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔄 图片格式转换器
          </h1>
          <p className="text-lg text-gray-600">
            支持 JPG、PNG、WebP 格式互转，批量处理，质量可调
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 目标格式选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标格式
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="jpeg">JPEG (.jpg)</option>
                <option value="png">PNG (.png)</option>
                <option value="webp">WebP (.webp)</option>
              </select>
            </div>

            {/* 质量设置 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片质量 {targetFormat !== 'png' && `(${Math.round(quality * 100)}%)`}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={targetFormat === 'png'}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
              />
              {targetFormat === 'png' && (
                <p className="text-xs text-gray-500 mt-1">PNG格式为无损压缩</p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isConverting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConverting ? '转换中...' : '选择图片'}
              </button>
            </div>
          </div>
        </div>

        {/* 拖拽上传区域 */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mb-8 hover:border-blue-400 transition-colors"
        >
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            拖拽图片到此处
          </h3>
          <p className="text-gray-600 mb-4">
            或点击上方"选择图片"按钮
          </p>
          <p className="text-sm text-gray-500">
            支持 JPG、PNG、WebP 格式，单个文件最大 10MB
          </p>
        </div>

        {/* 统计信息 */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalStats.count}</div>
                <div className="text-sm text-gray-600">已转换图片</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatFileSize(totalStats.originalSize)}
                </div>
                <div className="text-sm text-gray-600">原始大小</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatFileSize(totalStats.convertedSize)}
                </div>
                <div className="text-sm text-gray-600">转换后大小</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {compressionRatio > 0 ? `${compressionRatio}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">
                  {compressionRatio > 0 ? '压缩率' : '大小变化'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={downloadAllImages}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📦 下载全部 ({images.length})
              </button>
              <button
                onClick={clearAllImages}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ 清空全部
              </button>
            </div>
          </div>
        )}

        {/* 图片列表 */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {images.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* 图片预览 */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={image.convertedUrl}
                    alt="转换后的图片"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                {/* 图片信息 */}
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-2 truncate">
                    {image.originalFile.name}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>格式:</span>
                      <span>{image.originalFormat.toUpperCase()} → {image.targetFormat.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>原始大小:</span>
                      <span>{formatFileSize(image.originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>转换后:</span>
                      <span>{formatFileSize(image.convertedSize)}</span>
                    </div>
                    {image.originalSize !== image.convertedSize && (
                      <div className="flex justify-between">
                        <span>变化:</span>
                        <span className={image.convertedSize < image.originalSize ? 'text-green-600' : 'text-red-600'}>
                          {image.convertedSize < image.originalSize ? '-' : '+'}
                          {Math.round(Math.abs(1 - image.convertedSize / image.originalSize) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => downloadImage(image)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    📥 下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📖 使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">支持格式：</h4>
              <ul className="space-y-1">
                <li>• <strong>JPEG</strong> - 适合照片，文件小</li>
                <li>• <strong>PNG</strong> - 支持透明背景，无损压缩</li>
                <li>• <strong>WebP</strong> - 现代格式，压缩率高</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">使用技巧：</h4>
              <ul className="space-y-1">
                <li>• 照片建议转为 JPEG 格式</li>
                <li>• 图标、Logo 建议使用 PNG</li>
                <li>• WebP 格式文件最小但兼容性较差</li>
                <li>• 质量设置影响文件大小和画质</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />


    </Layout>
  );
}