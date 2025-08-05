'use client';

import { useState } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface TextTool {
  id: string;
  name: string;
  description: string;
  icon: string;
}

/**
 * 文本工具集组件
 * 提供各种文本处理和转换功能
 */
export default function TextTools() {
  const [activeTab, setActiveTab] = useState('case-converter');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexReplacement, setRegexReplacement] = useState('');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [hashType, setHashType] = useState('md5');

  const tools: TextTool[] = [
    { id: 'case-converter', name: '大小写转换', description: '转换文本大小写格式', icon: '🔤' },
    { id: 'text-processor', name: '文本处理', description: '去重、排序、清理文本', icon: '📝' },
    { id: 'regex-tester', name: '正则测试器', description: '测试和匹配正则表达式', icon: '🔍' },
    { id: 'encoder-decoder', name: '编码解码', description: 'Base64、URL、HTML编码', icon: '🔐' },
    { id: 'formatter', name: '格式化工具', description: 'JSON、XML、SQL格式化', icon: '🎨' },
    { id: 'generator', name: '生成器工具', description: '密码、哈希、随机文本', icon: '⚡' },
    { id: 'converter', name: '转换工具', description: '时间戳、进制、颜色转换', icon: '🔄' },
    { id: 'diff-tool', name: '文本对比', description: '比较两段文本的差异', icon: '📊' }
  ];

  /**
   * 大小写转换功能
   */
  const convertCase = (type: string) => {
    let result = '';
    switch (type) {
      case 'upper':
        result = inputText.toUpperCase();
        break;
      case 'lower':
        result = inputText.toLowerCase();
        break;
      case 'title':
        result = inputText.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'camel':
        result = inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '');
        break;
      case 'pascal':
        result = inputText
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
        break;
      case 'snake':
        result = inputText
          .replace(/\W+/g, ' ')
          .split(/ |\s/)
          .join('_')
          .toLowerCase();
        break;
      case 'kebab':
        result = inputText
          .replace(/\W+/g, ' ')
          .split(/ |\s/)
          .join('-')
          .toLowerCase();
        break;
    }
    setOutputText(result);
  };

  /**
   * 文本处理功能
   */
  const processText = (type: string) => {
    const lines = inputText.split('\n');
    let result = '';
    
    switch (type) {
      case 'remove-duplicates':
        result = [...new Set(lines)].join('\n');
        break;
      case 'sort-asc':
        result = lines.sort().join('\n');
        break;
      case 'sort-desc':
        result = lines.sort().reverse().join('\n');
        break;
      case 'remove-empty':
        result = lines.filter(line => line.trim() !== '').join('\n');
        break;
      case 'trim-lines':
        result = lines.map(line => line.trim()).join('\n');
        break;
      case 'reverse-lines':
        result = lines.reverse().join('\n');
        break;
      case 'shuffle':
        const shuffled = [...lines];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        result = shuffled.join('\n');
        break;
    }
    setOutputText(result);
  };

  /**
   * 正则表达式测试
   */
  const testRegex = () => {
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = inputText.match(regex) || [];
      setRegexMatches(matches);
      
      if (regexReplacement) {
        const replaced = inputText.replace(regex, regexReplacement);
        setOutputText(replaced);
      } else {
        setOutputText(matches.join('\n'));
      }
    } catch (error) {
      setRegexMatches([]);
      setOutputText('正则表达式语法错误');
    }
  };

  /**
   * 编码解码功能
   */
  const encodeDecodeText = (type: string, encode: boolean = true) => {
    try {
      let result = '';
      switch (type) {
        case 'base64':
          result = encode ? btoa(inputText) : atob(inputText);
          break;
        case 'url':
          result = encode ? encodeURIComponent(inputText) : decodeURIComponent(inputText);
          break;
        case 'html':
          if (encode) {
            result = inputText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          } else {
            result = inputText
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
          }
          break;
        case 'unicode':
          if (encode) {
            result = inputText.split('').map(char => 
              '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')
            ).join('');
          } else {
            result = inputText.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => 
              String.fromCharCode(parseInt(code, 16))
            );
          }
          break;
      }
      setOutputText(result);
    } catch (error) {
      setOutputText('编码/解码失败');
    }
  };

  /**
   * 格式化功能
   */
  const formatText = (type: string) => {
    try {
      let result = '';
      switch (type) {
        case 'json':
          const jsonObj = JSON.parse(inputText);
          result = JSON.stringify(jsonObj, null, 2);
          break;
        case 'json-minify':
          const jsonObjMin = JSON.parse(inputText);
          result = JSON.stringify(jsonObjMin);
          break;
        case 'xml':
          // 简单的XML格式化
          result = inputText
            .replace(/></g, '>\n<')
            .replace(/^\s*\n/gm, '')
            .split('\n')
            .map((line, index, array) => {
              const indent = '  '.repeat(Math.max(0, line.split('<').length - line.split('</').length - 1));
              return indent + line.trim();
            })
            .join('\n');
          break;
        case 'css':
          result = inputText
            .replace(/\{/g, ' {\n  ')
            .replace(/;/g, ';\n  ')
            .replace(/\}/g, '\n}\n')
            .replace(/,/g, ',\n')
            .replace(/\n\s*\n/g, '\n');
          break;
      }
      setOutputText(result);
    } catch (error) {
      setOutputText('格式化失败，请检查输入格式');
    }
  };

  /**
   * 生成器功能
   */
  const generateText = (type: string) => {
    let result = '';
    switch (type) {
      case 'password':
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const length = 16;
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        break;
      case 'uuid':
        result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        break;
      case 'lorem':
        const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
        result = lorem;
        break;
      case 'hash':
        // 简单的哈希模拟（实际应用中应使用crypto库）
        let hash = 0;
        for (let i = 0; i < inputText.length; i++) {
          const char = inputText.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // 转换为32位整数
        }
        result = Math.abs(hash).toString(16);
        break;
    }
    setOutputText(result);
  };

  /**
   * 转换工具
   */
  const convertValue = (type: string) => {
    try {
      let result = '';
      switch (type) {
        case 'timestamp-to-date':
          const timestamp = parseInt(inputText);
          result = new Date(timestamp * 1000).toLocaleString('zh-CN');
          break;
        case 'date-to-timestamp':
          const date = new Date(inputText);
          result = Math.floor(date.getTime() / 1000).toString();
          break;
        case 'hex-to-dec':
          result = parseInt(inputText, 16).toString();
          break;
        case 'dec-to-hex':
          result = parseInt(inputText).toString(16).toUpperCase();
          break;
        case 'bin-to-dec':
          result = parseInt(inputText, 2).toString();
          break;
        case 'dec-to-bin':
          result = parseInt(inputText).toString(2);
          break;
      }
      setOutputText(result);
    } catch (error) {
      setOutputText('转换失败，请检查输入格式');
    }
  };

  /**
   * 渲染工具内容
   */
  const renderToolContent = () => {
    switch (activeTab) {
      case 'case-converter':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔤</span>
                大小写转换工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => convertCase('upper')} 
                  className="group relative bg-gradient-to-br from-red-400 via-red-500 to-pink-500 hover:from-red-500 hover:via-red-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">AA</span>
                    <span>大写</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('lower')} 
                  className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">aa</span>
                    <span>小写</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('title')} 
                  className="group relative bg-gradient-to-br from-green-400 via-green-500 to-emerald-500 hover:from-green-500 hover:via-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">Aa</span>
                    <span>标题格式</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('camel')} 
                  className="group relative bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">aA</span>
                    <span>驼峰命名</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('pascal')} 
                  className="group relative bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 hover:from-orange-500 hover:via-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">AA</span>
                    <span>帕斯卡命名</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('snake')} 
                  className="group relative bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-500 hover:from-teal-500 hover:via-teal-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">a_a</span>
                    <span>下划线命名</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => convertCase('kebab')} 
                  className="group relative bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 hover:from-pink-500 hover:via-pink-600 hover:to-rose-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold">a-a</span>
                    <span>短横线命名</span>
                  </div>
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'text-processor':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-lg">
              <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                文本处理工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => processText('remove-duplicates')} 
                  className="group relative bg-white border-2 border-red-200 hover:border-red-400 text-red-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🗑️</span>
                    <span>去重</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('sort-asc')} 
                  className="group relative bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">⬆️</span>
                    <span>升序排序</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('sort-desc')} 
                  className="group relative bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">⬇️</span>
                    <span>降序排序</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('remove-empty')} 
                  className="group relative bg-white border-2 border-green-200 hover:border-green-400 text-green-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🧹</span>
                    <span>删除空行</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('trim-lines')} 
                  className="group relative bg-white border-2 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">✂️</span>
                    <span>清理空格</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('reverse-lines')} 
                  className="group relative bg-white border-2 border-teal-200 hover:border-teal-400 text-teal-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🔄</span>
                    <span>反转行</span>
                  </div>
                </button>
                <button 
                  onClick={() => processText('shuffle')} 
                  className="group relative bg-white border-2 border-pink-200 hover:border-pink-400 text-pink-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🎲</span>
                    <span>随机排序</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'regex-tester':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-lg">
              <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                正则表达式测试器
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                  <label className="block text-sm font-semibold text-indigo-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">🎯</span>
                    正则表达式
                  </label>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-mono text-sm"
                    placeholder="输入正则表达式"
                  />
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100 shadow-sm">
                  <label className="block text-sm font-semibold text-purple-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">🏷️</span>
                    标志
                  </label>
                  <input
                    type="text"
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-mono text-sm"
                    placeholder="g, i, m"
                  />
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-pink-100 shadow-sm">
                  <label className="block text-sm font-semibold text-pink-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">🔄</span>
                    替换文本
                  </label>
                  <input
                    type="text"
                    value={regexReplacement}
                    onChange={(e) => setRegexReplacement(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-mono text-sm"
                    placeholder="替换内容（可选）"
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={testRegex} 
                  className="group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="text-2xl animate-pulse">🚀</span>
                    <span>测试正则表达式</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </div>
            {regexMatches.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 shadow-2xl animate-fade-in-up">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-lg">
                  <h4 className="font-bold text-green-800 mb-6 flex items-center text-xl">
                    <span className="text-green-500 mr-3 text-2xl animate-bounce">🎯</span>
                    匹配结果 
                    <span className="ml-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {regexMatches.length} 个
                    </span>
                  </h4>
                  <div className="grid gap-4">
                    {regexMatches.map((match, index) => (
                      <div key={index} className="group bg-gradient-to-r from-white to-green-50 border-2 border-green-200 hover:border-green-400 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                            <span className="mr-1">🔍</span>
                            匹配 #{index + 1}
                          </span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(match)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1"
                          >
                            <span>📋</span>
                            <span>复制</span>
                          </button>
                        </div>
                        <div className="font-mono bg-gradient-to-r from-gray-50 to-green-50 px-4 py-3 rounded-lg border border-green-100 text-green-800 text-sm leading-relaxed break-all">
                          {match}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'encoder-decoder':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔐</span>
                编码解码工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button 
                  onClick={() => encodeDecodeText('base64', true)} 
                  className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">Base64 编码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('base64', false)} 
                  className="group relative bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">Base64 解码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('url', true)} 
                  className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">URL 编码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('url', false)} 
                  className="group relative bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">URL 解码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('html', true)} 
                  className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">HTML 编码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('html', false)} 
                  className="group relative bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">HTML 解码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('unicode', true)} 
                  className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">Unicode 编码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => encodeDecodeText('unicode', false)} 
                  className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">Unicode 解码</span>
                  <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'formatter':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📝</span>
                代码格式化工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => formatText('json')} 
                  className="group relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{ }</span>
                    <span>JSON 格式化</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => formatText('json-minify')} 
                  className="group relative bg-gradient-to-br from-red-400 via-red-500 to-pink-500 hover:from-red-500 hover:via-red-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:-rotate-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">⚡</span>
                    <span>JSON 压缩</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => formatText('xml')} 
                  className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">&lt; &gt;</span>
                    <span>XML 格式化</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button 
                  onClick={() => formatText('css')} 
                  className="group relative bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:-rotate-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">#</span>
                    <span>CSS 格式化</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'generator':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
              <h4 className="text-lg font-semibold text-violet-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🎲</span>
                内容生成工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => generateText('password')} 
                  className="group relative overflow-hidden bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-xl animate-pulse">🔒</span>
                    <span>生成密码</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                <button 
                  onClick={() => generateText('uuid')} 
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-xl animate-spin">🆔</span>
                    <span>生成 UUID</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                <button 
                  onClick={() => generateText('lorem')} 
                  className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-xl animate-bounce">📄</span>
                    <span>Lorem 文本</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                <button 
                  onClick={() => generateText('hash')} 
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-xl animate-pulse">🔐</span>
                    <span>生成哈希</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'converter':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
              <h4 className="text-lg font-semibold text-rose-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔄</span>
                数值转换工具
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => convertValue('timestamp-to-date')} 
                  className="group relative bg-white border-2 border-blue-200 hover:border-blue-400 text-blue-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">⏰</span>
                    <span>时间戳→日期</span>
                  </div>
                </button>
                <button 
                  onClick={() => convertValue('date-to-timestamp')} 
                  className="group relative bg-white border-2 border-green-200 hover:border-green-400 text-green-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">📅</span>
                    <span>日期→时间戳</span>
                  </div>
                </button>
                <button 
                  onClick={() => convertValue('hex-to-dec')} 
                  className="group relative bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">#</span>
                    <span>十六进制→十进制</span>
                  </div>
                </button>
                <button 
                  onClick={() => convertValue('dec-to-hex')} 
                  className="group relative bg-white border-2 border-orange-200 hover:border-orange-400 text-orange-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🔢</span>
                    <span>十进制→十六进制</span>
                  </div>
                </button>
                <button 
                  onClick={() => convertValue('bin-to-dec')} 
                  className="group relative bg-white border-2 border-teal-200 hover:border-teal-400 text-teal-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">01</span>
                    <span>二进制→十进制</span>
                  </div>
                </button>
                <button 
                  onClick={() => convertValue('dec-to-bin')} 
                  className="group relative bg-white border-2 border-pink-200 hover:border-pink-400 text-pink-700 hover:text-white px-5 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-lg">🔄</span>
                    <span>十进制→二进制</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'diff-tool':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
              <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                文本对比工具
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
                  <label className="block text-sm font-semibold text-blue-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">📄</span>
                    原始文本
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-mono text-sm resize-none"
                    placeholder="输入第一段文本..."
                  />
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm">
                  <label className="block text-sm font-semibold text-green-700 mb-3 flex items-center">
                    <span className="text-lg mr-2">📝</span>
                    对比文本
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm font-mono text-sm resize-none"
                    placeholder="输入第二段文本..."
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <button className="group relative bg-gradient-to-r from-slate-500 via-gray-500 to-slate-600 hover:from-slate-600 hover:via-gray-600 hover:to-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    <span className="text-2xl animate-pulse">🔍</span>
                    <span>开始对比</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </div>
              <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-center text-amber-700">
                  <span className="text-xl mr-2">🚧</span>
                  <span className="font-medium">此功能正在开发中，敬请期待更强大的文本对比功能！</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO {...seoConfigs.textTools} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 导航栏 */}
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-105">
                  ← 返回首页
                </Link>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🛠️ 文本工具集
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-4">
          {/* 工具选择器 */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {tools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`p-6 text-center border-b-2 transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tool.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-lg'
                      : 'border-transparent hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`text-3xl mb-2 transition-transform duration-300 ${
                    activeTab === tool.id ? 'scale-110' : 'hover:scale-110'
                  }`}>{tool.icon}</div>
                  <div className="text-sm font-medium">{tool.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 输入区域 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/20">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <span className="text-blue-500 mr-2">📝</span>
                  输入文本
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-mono text-sm bg-white/50 backdrop-blur-sm"
                  placeholder="在这里输入要处理的文本..."
                />
                <div className="mt-3 flex justify-between items-center text-sm">
                  <div className="text-gray-600">
                    字符数: <span className="font-semibold text-blue-600">{inputText.length}</span> | 
                    行数: <span className="font-semibold text-indigo-600">{inputText.split('\n').length}</span>
                  </div>
                  <div className="text-xs text-gray-400">实时统计</div>
                </div>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/20 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <span className="text-green-500 mr-2">✨</span>
                  输出结果
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(outputText)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm font-medium"
                >
                  📋 复制
                </button>
              </div>
              <div className="p-6">
                <textarea
                  value={outputText}
                  readOnly
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl resize-none bg-gradient-to-br from-gray-50 to-blue-50 font-mono text-sm"
                  placeholder="处理结果将显示在这里..."
                />
                <div className="mt-3 flex justify-between items-center text-sm">
                  <div className="text-gray-600">
                    字符数: <span className="font-semibold text-green-600">{outputText.length}</span> | 
                    行数: <span className="font-semibold text-emerald-600">{outputText.split('\n').length}</span>
                  </div>
                  <div className="text-xs text-gray-400">处理完成</div>
                </div>
              </div>
            </div>
          </div>

          {/* 工具操作区域 */}
          <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {tools.find(t => t.id === activeTab)?.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {tools.find(t => t.id === activeTab)?.description}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6">
              {renderToolContent()}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-primary {
          @apply px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium;
        }
        .btn-secondary {
          @apply px-4 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-md border border-gray-200 text-sm font-medium;
        }
        .input-field {
          @apply w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </>
  );
}