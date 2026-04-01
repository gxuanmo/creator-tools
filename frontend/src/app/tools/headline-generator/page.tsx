'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';
import Tooltip from '@/components/Tooltip';
import SEO, { seoConfigs } from '@/components/SEO';

interface HeadlineTemplate {
  id: string;
  name: string;
  template: string;
  description: string;
  category: string;
}

interface GeneratedHeadline {
  id: string;
  text: string;
  template: string;
  isFavorite: boolean;
}

interface HeadlineApiResponse {
  headlines?: string[];
  data?: {
    headlines?: Array<string | { title?: string; text?: string; platform?: string }>;
  };
}

function parseHeadlineResponse(result: HeadlineApiResponse): GeneratedHeadline[] {
  const rawHeadlines = result.headlines || result.data?.headlines || [];
  const headlines = rawHeadlines
    .map((headline) => {
      if (typeof headline === 'string') {
        return {
          id: Math.random().toString(36).slice(2, 11),
          text: headline,
          template: '通用',
          isFavorite: false,
        };
      }

      const text = headline.title || headline.text;
      if (!text) {
        return null;
      }

      return {
        id: Math.random().toString(36).slice(2, 11),
        text,
        template: headline.platform || '通用',
        isFavorite: false,
      };
    })
    .filter((headline): headline is GeneratedHeadline => headline !== null);

  if (headlines.length === 0) {
    throw new Error('接口已返回成功，但没有解析到可用标题');
  }

  return headlines;
}

/**
 * 标题生成器页面组件
 * 基于模板和关键词生成各种类型的标题
 */
export default function HeadlineGeneratorPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedHeadlines, setGeneratedHeadlines] = useState<GeneratedHeadline[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const toast = useToast();

  // 预定义的标题模板
  const headlineTemplates: HeadlineTemplate[] = [
    // YouTube 标题模板
    {
      id: '1',
      name: '惊喜揭秘',
      template: '你绝对想不到的{keyword}秘密！',
      description: '制造悬念，激发好奇心',
      category: 'youtube'
    },
    {
      id: '2',
      name: '数字冲击',
      template: '10个关于{keyword}的惊人事实',
      description: '用具体数字增加可信度',
      category: 'youtube'
    },
    {
      id: '3',
      name: '对比分析',
      template: '{keyword} VS 传统方法：哪个更好？',
      description: '通过对比引发讨论',
      category: 'youtube'
    },
    {
      id: '4',
      name: '终极指南',
      template: '2024年{keyword}完全指南',
      description: '权威性内容，适合教程类',
      category: 'youtube'
    },
    {
      id: '5',
      name: '错误避免',
      template: '使用{keyword}时千万别犯这些错误',
      description: '警示性标题，实用价值高',
      category: 'youtube'
    },

    // 博客标题模板
    {
      id: '6',
      name: '深度解析',
      template: '深度解析：{keyword}的前世今生',
      description: '专业深入的分析文章',
      category: 'blog'
    },
    {
      id: '7',
      name: '实战经验',
      template: '我用{keyword}一年后的真实感受',
      description: '个人经验分享，真实可信',
      category: 'blog'
    },
    {
      id: '8',
      name: '趋势预测',
      template: '{keyword}的未来：5大趋势预测',
      description: '前瞻性内容，引发思考',
      category: 'blog'
    },
    {
      id: '9',
      name: '问题解决',
      template: '如何用{keyword}解决常见问题',
      description: '实用性强，解决痛点',
      category: 'blog'
    },

    // 社交媒体标题模板
    {
      id: '10',
      name: '热点话题',
      template: '今天的{keyword}热搜，你怎么看？',
      description: '结合热点，引发讨论',
      category: 'social'
    },
    {
      id: '11',
      name: '快速技巧',
      template: '30秒学会{keyword}的核心技巧',
      description: '快节奏，适合短视频',
      category: 'social'
    },
    {
      id: '12',
      name: '情感共鸣',
      template: '每个人都应该了解的{keyword}真相',
      description: '情感化表达，增强共鸣',
      category: 'social'
    },

    // 营销标题模板
    {
      id: '13',
      name: '限时优惠',
      template: '限时！{keyword}特价优惠，错过再等一年',
      description: '营造紧迫感，促进转化',
      category: 'marketing'
    },
    {
      id: '14',
      name: '独家揭秘',
      template: '独家！{keyword}行业内幕大揭秘',
      description: '独特性卖点，吸引关注',
      category: 'marketing'
    },
    {
      id: '15',
      name: '成功案例',
      template: '他们用{keyword}实现了财务自由',
      description: '成功故事，激发欲望',
      category: 'marketing'
    }
  ];

  const categories = [
    { id: 'all', name: '全部类型' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'blog', name: '博客文章' },
    { id: 'social', name: '社交媒体' },
    { id: 'marketing', name: '营销推广' }
  ];

  /**
   * 获取过滤后的模板
   */
  const getFilteredTemplates = () => {
    if (selectedCategory === 'all') {
      return headlineTemplates;
    }
    return headlineTemplates.filter(template => template.category === selectedCategory);
  };

  /**
   * 生成标题
   */
  const generateHeadlines = async () => {
    if (!keyword.trim()) {
      toast.warning('请输入关键词', '关键词不能为空');
      return;
    }

    setIsGenerating(true);
    
    try {
      // 调用后端API生成标题
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      // 映射前端分类到后端平台类型
      const platformMap: { [key: string]: string } = {
        'all': 'general',
        'youtube': 'youtube',
        'blog': 'blog',
        'social': 'twitter',
        'marketing': 'general'
      };

      const response = await fetch(`${apiUrl}/api/headlines/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: keyword.trim(),
          keywords: keyword.trim(),
          platform: platformMap[selectedCategory] || 'general',
          tone: 'casual',
          count: 5
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '标题生成失败');
      }

      const result: HeadlineApiResponse = await response.json();
      const headlines = parseHeadlineResponse(result);
      
      setGeneratedHeadlines(headlines);
      toast.success('生成完成', `为您生成了 ${headlines.length} 个标题`);
    } catch (error) {
      console.error('标题生成失败:', error);
      toast.error('生成失败', error instanceof Error ? error.message : '标题生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 复制标题到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('复制成功', '标题已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败', '无法访问剪贴板');
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = (headlineId: string) => {
    setGeneratedHeadlines(prev => 
      prev.map(headline => 
        headline.id === headlineId 
          ? { ...headline, isFavorite: !headline.isFavorite }
          : headline
      )
    );

    setFavorites(prev => {
      const headline = generatedHeadlines.find(h => h.id === headlineId);
      if (!headline) return prev;
      
      const isFavorited = prev.includes(headline.text);
      const newFavorites = isFavorited 
        ? prev.filter(fav => fav !== headline.text)
        : [...prev, headline.text];
      
      toast.info(
        isFavorited ? '已取消收藏' : '已添加收藏',
        isFavorited ? '从收藏列表中移除' : '添加到收藏列表'
      );
      
      return newFavorites;
    });
  };

  /**
   * 导出收藏的标题
   */
  const exportFavorites = () => {
    const favoriteHeadlines = generatedHeadlines.filter(h => h.isFavorite);
    if (favoriteHeadlines.length === 0) {
      toast.warning('请先收藏一些标题', '没有可导出的收藏标题');
      return;
    }

    const content = favoriteHeadlines.map(h => h.text).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${keyword}_标题收藏.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('导出成功', '收藏标题已保存到本地');
  };

  /**
   * 清空结果
   */
  const clearResults = () => {
    setGeneratedHeadlines([]);
    setFavorites([]);
  };

  return (
    <>
      <SEO {...seoConfigs.headlineGenerator} />
      <Layout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            标题生成器
          </h1>
          <p className="text-gray-600">
            基于关键词和模板，快速生成吸引人的标题
          </p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* 关键词输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词
              </label>
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="输入你的关键词，如：AI、编程、健身等"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={e => e.key === 'Enter' && generateHeadlines()}
              />
            </div>

            {/* 类型选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题类型
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <div className="flex justify-center">
              <button
                onClick={generateHeadlines}
                disabled={isGenerating || !keyword.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isGenerating ? '生成中...' : '生成标题'}
              </button>
            </div>
          </div>
        </div>

        {/* 生成进度 */}
        {isGenerating && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">正在生成标题...</span>
            </div>
          </div>
        )}

        {/* 生成结果 */}
        {generatedHeadlines.length > 0 && (
          <div className="space-y-6">
            {/* 操作栏 */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                生成结果 ({generatedHeadlines.length} 个标题)
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={exportFavorites}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  导出收藏 ({generatedHeadlines.filter(h => h.isFavorite).length})
                </button>
                <button
                  onClick={clearResults}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  清空结果
                </button>
              </div>
            </div>

            {/* 标题列表 */}
            <div className="grid gap-4">
              {generatedHeadlines.map(headline => (
                <div
                  key={headline.id}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-lg text-gray-900 mb-1">
                        {headline.text}
                      </p>
                      <p className="text-sm text-gray-500">
                        模板：{headline.template}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Tooltip content={headline.isFavorite ? '取消收藏' : '添加收藏'}>
                        <button
                          onClick={() => toggleFavorite(headline.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            headline.isFavorite
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {headline.isFavorite ? '★' : '☆'}
                        </button>
                      </Tooltip>
                      <Tooltip content="复制到剪贴板">
                        <button
                          onClick={() => copyToClipboard(headline.text)}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          复制
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        {generatedHeadlines.length === 0 && !isGenerating && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              使用说明
            </h3>
            <div className="space-y-3 text-gray-600">
              <p>• 输入你的核心关键词，如产品名称、主题等</p>
              <p>• 选择适合的标题类型（YouTube、博客、社交媒体等）</p>
              <p>• 点击生成按钮，获得多个标题建议</p>
              <p>• 收藏喜欢的标题，一键复制或批量导出</p>
            </div>
          </div>
        )}
        </div>
      </div>
      </Layout>
    </>
  );
}
