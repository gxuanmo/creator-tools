/**
 * 前端标题生成器API集成示例
 * 这个文件展示如何将前端页面改造为调用后端API
 */

'use client';

import { useState } from 'react';

// API调用接口类型定义
interface GenerateHeadlineRequest {
  topic: string;
  keywords?: string;
  platform?: string;
  tone?: string;
  count?: number;
}

interface HeadlineResponse {
  headlines: string[];
  timestamp: string;
  parameters: GenerateHeadlineRequest;
}

// API调用函数
const generateHeadlines = async (data: GenerateHeadlineRequest): Promise<HeadlineResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/headlines/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '标题生成失败');
  }

  return response.json();
};

// 标题生成器组件
export default function HeadlineGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    platform: 'general',
    tone: 'informative',
    count: 5,
  });
  
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      setError('请输入主题内容');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateHeadlines({
        topic: formData.topic,
        keywords: formData.keywords || undefined,
        platform: formData.platform,
        tone: formData.tone,
        count: formData.count,
      });
      
      setHeadlines(result.headlines);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 智能标题生成器
          </h1>
          <p className="text-gray-600">
            基于AI技术，为不同平台生成吸引人的标题
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 主题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题内容 *
              </label>
              <textarea
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="请输入您要生成标题的主题内容..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            {/* 关键词输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词（可选）
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="用逗号分隔多个关键词"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 平台选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标平台
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">通用</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="blog">博客</option>
                </select>
              </div>

              {/* 语调选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  语调风格
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="informative">信息性</option>
                  <option value="professional">专业</option>
                  <option value="casual">轻松</option>
                  <option value="humorous">幽默</option>
                  <option value="dramatic">戏剧化</option>
                </select>
              </div>

              {/* 数量选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成数量
                </label>
                <select
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3个</option>
                  <option value={5}>5个</option>
                  <option value={8}>8个</option>
                  <option value={10}>10个</option>
                </select>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading || !formData.topic.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 生成中...' : '🎯 生成标题'}
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-700">{error}</span>
            </div>
            {error.includes('API密钥') && (
              <div className="mt-2 text-sm text-red-600">
                💡 请在后端.env文件中配置OPENAI_API_KEY
              </div>
            )}
          </div>
        )}

        {/* 生成结果 */}
        {headlines.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📝 生成的标题 ({headlines.length}个)
            </h2>
            <div className="space-y-3">
              {headlines.map((headline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="flex-1 text-gray-800">
                    <span className="font-medium text-blue-600 mr-2">
                      {index + 1}.
                    </span>
                    {headline}
                  </span>
                  <button
                    onClick={() => copyToClipboard(headline)}
                    className="ml-4 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm"
                  >
                    📋 复制
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const allHeadlines = headlines.join('\n');
                  copyToClipboard(allHeadlines);
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                📋 复制全部标题
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}