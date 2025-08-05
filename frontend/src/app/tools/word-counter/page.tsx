'use client';

import { useState, useEffect, useMemo } from 'react';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  keywordDensity: { [key: string]: number };
}

interface ReadabilityScore {
  score: number;
  level: string;
  description: string;
}

/**
 * 字数统计与分析器页面
 * 提供实时的文本统计和分析功能
 */
export default function WordCounterPage() {
  const [text, setText] = useState('');
  const toast = useToast();

  /**
   * 计算文本统计信息
   * @param text 输入文本
   * @returns 统计结果
   */
  const calculateStats = useMemo((): TextStats => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0,
        keywordDensity: {}
      };
    }

    // 基础统计
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // 词数统计（支持中英文）
    const chineseWords = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
    const words = chineseWords + englishWords;
    
    // 句子统计
    const sentences = (text.match(/[.!?。！？]+/g) || []).length;
    
    // 段落统计
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    
    // 阅读时间计算（中文250字/分钟，英文200词/分钟）
    const readingTime = Math.ceil((chineseWords / 250 + englishWords / 200));
    
    // 关键词密度分析
    const keywordDensity: { [key: string]: number } = {};
    if (words > 0) {
      // 提取中文词汇（2-4字）
      const chineseKeywords = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
      // 提取英文词汇
      const englishKeywords = text.match(/\b[a-zA-Z]{3,}\b/g) || [];
      
      const allKeywords = [...chineseKeywords, ...englishKeywords.map(w => w.toLowerCase())];
      
      allKeywords.forEach(keyword => {
        keywordDensity[keyword] = (keywordDensity[keyword] || 0) + 1;
      });
      
      // 转换为百分比并只保留出现次数>=2的关键词
      Object.keys(keywordDensity).forEach(keyword => {
        const count = keywordDensity[keyword];
        if (count < 2) {
          delete keywordDensity[keyword];
        } else {
          keywordDensity[keyword] = Math.round((count / words) * 100 * 100) / 100;
        }
      });
    }
    
    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      keywordDensity
    };
  }, [text]);

  /**
   * 计算可读性评分
   */
  const readabilityScore = useMemo((): ReadabilityScore => {
    const stats = calculateStats;
    
    if (stats.words === 0 || stats.sentences === 0) {
      return {
        score: 0,
        level: '无法评估',
        description: '文本太短，无法进行可读性分析'
      };
    }
    
    // 简化的可读性评分算法
    const avgWordsPerSentence = stats.words / stats.sentences;
    const avgCharsPerWord = stats.charactersNoSpaces / stats.words;
    
    // 评分计算（分数越低越易读）
    let score = avgWordsPerSentence * 0.5 + avgCharsPerWord * 2;
    
    // 中文调整
    const chineseRatio = (text.match(/[\u4e00-\u9fa5]/g) || []).length / stats.charactersNoSpaces;
    if (chineseRatio > 0.5) {
      score = score * 0.8; // 中文相对更易读
    }
    
    score = Math.round(score * 10) / 10;
    
    let level: string;
    let description: string;
    
    if (score <= 8) {
      level = '很容易';
      description = '文本简洁易懂，适合大众阅读';
    } else if (score <= 12) {
      level = '容易';
      description = '文本较为易读，适合一般读者';
    } else if (score <= 16) {
      level = '中等';
      description = '文本难度适中，需要一定阅读能力';
    } else if (score <= 20) {
      level = '困难';
      description = '文本较为复杂，需要较强阅读能力';
    } else {
      level = '很困难';
      description = '文本非常复杂，需要专业背景';
    }
    
    return { score, level, description };
  }, [text, calculateStats]);

  /**
   * 清空文本
   */
  const clearText = () => {
    setText('');
    toast.info('文本已清空');
  };

  /**
   * 复制统计结果
   */
  const copyStats = async () => {
    const stats = calculateStats;
    const readability = readabilityScore;
    
    const statsText = `文本统计结果：
字符数：${stats.characters}
字符数（不含空格）：${stats.charactersNoSpaces}
词数：${stats.words}
句子数：${stats.sentences}
段落数：${stats.paragraphs}
预计阅读时间：${stats.readingTime} 分钟
可读性：${readability.level}（${readability.score}分）`;
    
    try {
      await navigator.clipboard.writeText(statsText);
      toast.success('统计结果已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };



  /**
   * 获取排序后的关键词
   */
  const sortedKeywords = useMemo(() => {
    return Object.entries(calculateStats.keywordDensity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // 只显示前10个
  }, [calculateStats.keywordDensity]);

  return (
    <Layout>
      <SEO 
        title="字数统计与分析器 - Creator Tools"
        description="实时统计文本字数、字符数、段落数，分析关键词密度和可读性，为内容创作提供数据支持"
        keywords={['字数统计', '文本分析', '可读性', '关键词密度', '内容创作']}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📊 字数统计与分析器
          </h1>
          <p className="text-lg text-gray-600">
            实时分析文本统计信息，提供可读性评分和关键词密度分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 文本输入区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  文本输入
                </h2>
                <button
                  onClick={clearText}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={!text.trim()}
                >
                  清空文本
                </button>
              </div>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在此输入或粘贴您的文本内容...\n\n支持中英文混合文本分析"
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              
              <div className="mt-4 text-sm text-gray-500">
                💡 提示：支持中英文混合文本，实时更新统计结果
              </div>
            </div>
          </div>

          {/* 统计结果区域 */}
          <div className="space-y-6">
            {/* 基础统计 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  基础统计
                </h3>
                <button
                  onClick={copyStats}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="复制统计结果"
                >
                  📋
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">字符数：</span>
                  <span className="font-semibold text-blue-600">
                    {calculateStats.characters.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">字符数（不含空格）：</span>
                  <span className="font-semibold text-blue-600">
                    {calculateStats.charactersNoSpaces.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">词数：</span>
                  <span className="font-semibold text-green-600">
                    {calculateStats.words.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">句子数：</span>
                  <span className="font-semibold text-purple-600">
                    {calculateStats.sentences.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">段落数：</span>
                  <span className="font-semibold text-orange-600">
                    {calculateStats.paragraphs.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">预计阅读时间：</span>
                  <span className="font-semibold text-red-600">
                    {calculateStats.readingTime} 分钟
                  </span>
                </div>
              </div>
            </div>

            {/* 可读性分析 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                可读性分析
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {readabilityScore.score}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {readabilityScore.level}
                </div>
                <div className="text-sm text-gray-600">
                  {readabilityScore.description}
                </div>
              </div>
            </div>

            {/* 关键词密度 */}
            {sortedKeywords.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  关键词密度
                </h3>
                
                <div className="space-y-2">
                  {sortedKeywords.map(([keyword, density]) => (
                    <div key={keyword} className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">{keyword}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${Math.min(density * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">
                          {density}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  💡 只显示出现2次以上的关键词
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📖 使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">功能特点：</h4>
              <ul className="space-y-1">
                <li>• 支持中英文混合文本分析</li>
                <li>• 实时更新统计结果</li>
                <li>• 智能关键词密度分析</li>
                <li>• 可读性评分算法</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">使用技巧：</h4>
              <ul className="space-y-1">
                <li>• 点击复制按钮快速复制统计结果</li>
                <li>• 关键词密度帮助优化SEO</li>
                <li>• 可读性评分指导内容优化</li>
                <li>• 预计阅读时间帮助规划内容长度</li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </Layout>
  );
}