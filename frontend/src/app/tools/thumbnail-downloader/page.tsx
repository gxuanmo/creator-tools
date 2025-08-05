'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';
import Tooltip from '@/components/Tooltip';
import SEO, { seoConfigs } from '@/components/SEO';

interface ThumbnailQuality {
  id: string;
  name: string;
  resolution: string;
  urlSuffix: string;
}

interface VideoInfo {
  id: string;
  title: string;
  thumbnails: {
    quality: string;
    url: string;
    resolution: string;
  }[];
}

/**
 * YouTube缩略图下载器页面组件
 * 支持批量下载不同质量的缩略图
 */
export default function ThumbnailDownloaderPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQualities, setSelectedQualities] = useState<string[]>(['maxresdefault']);
  const [downloadHistory, setDownloadHistory] = useState<VideoInfo[]>([]);
  const toast = useToast();

  // YouTube缩略图质量选项
  const thumbnailQualities: ThumbnailQuality[] = [
    {
      id: 'maxresdefault',
      name: '最高质量',
      resolution: '1280x720',
      urlSuffix: 'maxresdefault.jpg'
    },
    {
      id: 'sddefault',
      name: '标准质量',
      resolution: '640x480',
      urlSuffix: 'sddefault.jpg'
    },
    {
      id: 'hqdefault',
      name: '高质量',
      resolution: '480x360',
      urlSuffix: 'hqdefault.jpg'
    },
    {
      id: 'mqdefault',
      name: '中等质量',
      resolution: '320x180',
      urlSuffix: 'mqdefault.jpg'
    },
    {
      id: 'default',
      name: '默认质量',
      resolution: '120x90',
      urlSuffix: 'default.jpg'
    }
  ];

  /**
   * 从YouTube URL中提取视频ID
   * @param url YouTube视频URL
   * @returns 视频ID或null
   */
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // 如果直接输入的是视频ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  };

  /**
   * 获取视频信息和缩略图
   */
  const fetchVideoInfo = async () => {
    if (!videoUrl.trim()) {
      toast.warning('请输入视频链接', '视频链接不能为空');
      return;
    }

    setIsLoading(true);
    
    try {
      // 调用后端API获取缩略图
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/thumbnail?url=${encodeURIComponent(videoUrl.trim())}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '获取缩略图失败');
      }

      const result = await response.json();
      const { platform, videoId, thumbnails } = result.data;

      // 转换API响应格式为前端需要的格式
      const thumbnailList = [
        { quality: 'default', url: thumbnails.default, resolution: '120x90' },
        { quality: 'medium', url: thumbnails.medium, resolution: '320x180' },
        { quality: 'high', url: thumbnails.high, resolution: '480x360' },
        { quality: 'maxres', url: thumbnails.maxres, resolution: '1280x720' }
      ];

      const info: VideoInfo = {
        id: videoId,
        title: `${platform.toUpperCase()}视频_${videoId}`,
        thumbnails: thumbnailList
      };

      setVideoInfo(info);
      
      // 添加到历史记录
      setDownloadHistory(prev => {
        const exists = prev.find(item => item.id === videoId);
        if (exists) return prev;
        return [info, ...prev.slice(0, 9)]; // 保留最近10个
      });
      
      toast.success('获取成功', `找到 ${thumbnailList.length} 个缩略图`);

    } catch (error) {
      console.error('获取视频信息失败:', error);
      toast.error('获取失败', error instanceof Error ? error.message : '无法获取视频信息，请检查链接是否正确');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 检查图片是否存在
   * @param url 图片URL
   * @returns Promise<boolean>
   */
  const checkImageExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  /**
   * 下载单个缩略图
   * @param thumbnail 缩略图信息
   * @param filename 文件名
   */
  const downloadSingleThumbnail = async (thumbnail: any, filename: string) => {
    try {
      const exists = await checkImageExists(thumbnail.url);
      if (!exists) {
        toast.error('图片不存在', `${thumbnail.resolution} 质量的缩略图不存在`);
        return;
      }

      const response = await fetch(thumbnail.url);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      const blob = await response.blob();
      saveAs(blob, filename);
      toast.success('下载成功', `${filename} 已保存到本地`);
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败', '无法下载缩略图，请重试');
    }
  };

  /**
   * 批量下载选中质量的缩略图
   */
  const downloadSelectedThumbnails = async () => {
    if (!videoInfo || selectedQualities.length === 0) {
      alert('请选择要下载的质量');
      return;
    }

    try {
      const selectedThumbnails = videoInfo.thumbnails.filter(thumb => 
        selectedQualities.includes(thumb.quality)
      );

      if (selectedThumbnails.length === 1) {
        // 单个文件直接下载
        const thumbnail = selectedThumbnails[0];
        const qualityName = thumbnailQualities.find(q => q.id === thumbnail.quality)?.name || thumbnail.quality;
        const filename = `${videoInfo.title}_${qualityName}_${thumbnail.resolution}.jpg`;
        await downloadSingleThumbnail(thumbnail, filename);
      } else {
        // 多个文件打包下载
        const zip = new JSZip();
        
        for (const thumbnail of selectedThumbnails) {
          const exists = await checkImageExists(thumbnail.url);
          if (exists) {
            const response = await fetch(thumbnail.url);
            const blob = await response.blob();
            const qualityName = thumbnailQualities.find(q => q.id === thumbnail.quality)?.name || thumbnail.quality;
            const filename = `${qualityName}_${thumbnail.resolution}.jpg`;
            zip.file(filename, blob);
          }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${videoInfo.title}_thumbnails.zip`);
        toast.success('批量下载完成', `${selectedQualities.length} 个缩略图已打包下载`);
      }
    } catch (error) {
      console.error('批量下载失败:', error);
      toast.error('批量下载失败', '创建压缩包时出现错误，请重试');
    }
  };

  /**
   * 切换质量选择
   * @param qualityId 质量ID
   */
  const toggleQuality = (qualityId: string) => {
    setSelectedQualities(prev => {
      if (prev.includes(qualityId)) {
        return prev.filter(id => id !== qualityId);
      } else {
        return [...prev, qualityId];
      }
    });
  };

  /**
   * 从历史记录加载视频
   * @param video 视频信息
   */
  const loadFromHistory = (video: VideoInfo) => {
    setVideoInfo(video);
    setVideoUrl(`https://www.youtube.com/watch?v=${video.id}`);
  };

  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    setDownloadHistory([]);
  };

  return (
    <>
      <SEO {...seoConfigs.thumbnailDownloader} />
      <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            YouTube缩略图下载器
          </h1>
          <p className="text-gray-600">
            快速下载YouTube视频的高质量缩略图
          </p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube视频链接
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="粘贴YouTube视频链接，如：https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={e => e.key === 'Enter' && fetchVideoInfo()}
                />
                <button
                  onClick={fetchVideoInfo}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? '获取中...' : '获取缩略图'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">正在获取缩略图...</span>
            </div>
          </div>
        )}

        {/* 缩略图预览和下载 */}
        {videoInfo && (
          <div className="space-y-6">
            {/* 视频信息 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                视频信息
              </h3>
              <p className="text-gray-600 mb-4">视频ID: {videoInfo.id}</p>
              
              {/* 质量选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择下载质量
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {thumbnailQualities.map(quality => (
                    <label
                      key={quality.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedQualities.includes(quality.id)}
                        onChange={() => toggleQuality(quality.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{quality.name}</div>
                        <div className="text-gray-500">{quality.resolution}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 下载按钮 */}
              <div className="flex justify-center">
                <Tooltip content={selectedQualities.length === 0 ? '请先选择要下载的缩略图' : `下载 ${selectedQualities.length} 个缩略图`}>
                  <button
                    onClick={downloadSelectedThumbnails}
                    disabled={selectedQualities.length === 0}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    下载选中质量 ({selectedQualities.length})
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* 缩略图预览 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                缩略图预览
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoInfo.thumbnails.map(thumbnail => {
                  const quality = thumbnailQualities.find(q => q.id === thumbnail.quality);
                  const isSelected = selectedQualities.includes(thumbnail.quality);
                  
                  return (
                    <div
                      key={thumbnail.quality}
                      className={`border-2 rounded-lg p-3 transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <img
                          src={thumbnail.url}
                          alt={`${quality?.name} 缩略图`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400">图片不存在</div>';
                            }
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900 text-sm">
                          {quality?.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {thumbnail.resolution}
                        </div>
                        <Tooltip content="下载此缩略图">
                          <button
                            onClick={() => downloadSingleThumbnail(
                              thumbnail, 
                              `${videoInfo.title}_${quality?.name}_${thumbnail.resolution}.jpg`
                            )}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            单独下载
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 下载历史 */}
        {downloadHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                下载历史
              </h3>
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                清空历史
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {downloadHistory.map(video => (
                <div
                  key={video.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => loadFromHistory(video)}
                >
                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt="缩略图"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 truncate">
                      {video.title}
                    </div>
                    <div className="text-gray-500 text-xs">
                      ID: {video.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        {!videoInfo && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              使用说明
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>• 支持多种YouTube链接格式：完整链接、短链接、嵌入链接等</p>
              <p>• 提供5种不同质量的缩略图：从120x90到1280x720</p>
              <p>• 可以单独下载或批量打包下载</p>
              <p>• 自动保存下载历史，方便重复使用</p>
              <p>• 完全在浏览器中运行，保护隐私安全</p>
            </div>
          </div>
        )}
        </div>
        </div>
      </Layout>
    </>
  );
}