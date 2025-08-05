'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';
import Tooltip from '@/components/Tooltip';
import SEO, { seoConfigs } from '@/components/SEO';

interface CompressedImage {
  id: string;
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRate: number;
  preview: string;
}

/**
 * 图片压缩器页面组件
 * 支持批量上传、压缩图片，并提供下载功能
 */
export default function ImageCompressorPage() {
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const toast = useToast();

  /**
   * 压缩单个图片文件
   * @param file 原始图片文件
   * @returns 压缩后的图片信息
   */
  const compressImage = async (file: File): Promise<CompressedImage> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: compressionQuality,
      };

      const compressedFile = await imageCompression(file, options);
      const preview = URL.createObjectURL(file);
      const compressionRate = Math.round(
        ((file.size - compressedFile.size) / file.size) * 100
      );

      return {
        id: Math.random().toString(36).substr(2, 9),
        originalFile: file,
        compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRate,
        preview,
      };
    } catch (error) {
      console.error('图片压缩失败:', error);
      toast.error('压缩失败', '处理图片时出现错误，请重试');
      throw error;
    }
  };

  /**
   * 处理文件上传
   * @param acceptedFiles 上传的文件列表
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsCompressing(true);
      try {
        const compressedImages = await Promise.all(
          acceptedFiles.map(compressImage)
        );
        setImages(prev => [...prev, ...compressedImages]);
        toast.success('压缩完成', `成功压缩 ${compressedImages.length} 张图片`);
      } catch (error) {
        console.error('批量压缩失败:', error);
        toast.error('压缩失败', '处理图片时出现错误，请重试');
      } finally {
        setIsCompressing(false);
      }
    },
    [compressionQuality]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  /**
   * 下载单个压缩后的图片
   * @param image 图片信息
   */
  const downloadImage = (image: CompressedImage) => {
    const url = URL.createObjectURL(image.compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${image.originalFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * 批量下载所有压缩后的图片为ZIP文件
   */
  const downloadAllAsZip = async () => {
    if (images.length === 0) return;

    try {
      const zip = new JSZip();
      
      images.forEach(image => {
        zip.file(`compressed_${image.originalFile.name}`, image.compressedFile);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'compressed_images.zip');
      toast.success('下载开始', '压缩包正在下载中');
    } catch (error) {
      console.error('ZIP打包失败:', error);
      toast.error('下载失败', '创建压缩包时出现错误');
    }
  };

  /**
   * 删除指定图片
   * @param id 图片ID
   */
  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // 清理预览URL
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  /**
   * 清空所有图片
   */
  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的文件大小字符串
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <SEO {...seoConfigs.imageCompressor} />
      <Layout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            图片压缩器
          </h1>
          <p className="text-gray-600">
            批量压缩图片，减小文件大小，保持画质
          </p>
        </div>

        {/* 压缩质量控制 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                压缩质量: {Math.round(compressionQuality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={compressionQuality}
                onChange={e => setCompressionQuality(parseFloat(e.target.value))}
                className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            {images.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={downloadAllAsZip}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  全部下载(.zip)
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  清空全部
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 上传区域 */}
        {images.length === 0 && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📁</div>
            <div className="text-xl text-gray-600 mb-2">
              {isDragActive ? '放开以上传图片' : '拖拽图片到这里，或'}
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              点击上传
            </button>
            <p className="text-sm text-gray-500 mt-4">
              支持 JPG、PNG、WebP 格式，单文件最大 10MB，最多 20 张图片
            </p>
          </div>
        )}

        {/* 压缩进度 */}
        {isCompressing && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">正在压缩图片...</span>
            </div>
          </div>
        )}

        {/* 压缩结果 */}
        {images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              压缩结果 ({images.length} 张图片)
            </h3>
            
            {images.map(image => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4"
              >
                {/* 图片预览 */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={image.preview}
                    alt={image.originalFile.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 图片信息 */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {image.originalFile.name}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {formatFileSize(image.originalSize)} → {formatFileSize(image.compressedSize)}
                    <span className="text-green-600 font-medium ml-2">
                      ({image.compressionRate}% 压缩)
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadImage(image)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    下载
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      </Layout>
    </>
  );
}