'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWorkspace } from '../hooks/useWorkspace';

interface WorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Workspace({ isOpen, onClose }: WorkspaceProps) {
  const {
    history,
    favorites,
    recentProjects,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    deleteProject,
    clearHistory,
    clearFavorites,
    getToolStats,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'projects' | 'stats'>('history');
  const stats = getToolStats();

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(timestamp);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">工作空间</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b">
          {[
            { key: 'history', label: '历史记录', count: history.length },
            { key: 'favorites', label: '收藏夹', count: favorites.length },
            { key: 'projects', label: '最近项目', count: recentProjects.length },
            { key: 'stats', label: '统计信息', count: null },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 历史记录 */}
          {activeTab === 'history' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">最近使用的工具</h3>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    清空历史
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>还没有使用过任何工具</p>
                  <p className="text-sm mt-2">开始使用工具后，这里会显示您的使用历史</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Link href={item.href} className="flex items-center flex-1" onClick={onClose}>
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            使用 {item.usageCount} 次 • {formatRelativeTime(item.lastUsed)}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          if (isFavorite(item.id)) {
                            removeFromFavorites(item.id);
                          } else {
                            addToFavorites(item);
                          }
                        }}
                        className={`ml-4 p-2 rounded-full transition-colors ${
                          isFavorite(item.id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isFavorite(item.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 收藏夹 */}
          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">收藏的工具</h3>
                {favorites.length > 0 && (
                  <button
                    onClick={clearFavorites}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    清空收藏
                  </button>
                )}
              </div>
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">⭐</div>
                  <p>还没有收藏任何工具</p>
                  <p className="text-sm mt-2">点击工具旁边的星星图标来收藏常用工具</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Link href={item.href} className="flex items-center flex-1" onClick={onClose}>
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            收藏于 {formatDate(item.addedAt)}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => removeFromFavorites(item.id)}
                        className="ml-4 p-2 text-yellow-500 hover:text-red-500 transition-colors rounded-full"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 最近项目 */}
          {activeTab === 'projects' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">最近的项目</h3>
              {recentProjects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📁</div>
                  <p>还没有保存任何项目</p>
                  <p className="text-sm mt-2">在工具中保存您的工作进度后，这里会显示最近的项目</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            更新于 {formatRelativeTime(project.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/tools/${project.toolId}?project=${project.id}`}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={onClose}
                          >
                            打开
                          </Link>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 统计信息 */}
          {activeTab === 'stats' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">使用统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalTools}</div>
                  <div className="text-sm text-blue-800 mt-1">使用过的工具</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.totalUsage}</div>
                  <div className="text-sm text-green-800 mt-1">总使用次数</div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.favoriteCount}</div>
                  <div className="text-sm text-yellow-800 mt-1">收藏的工具</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.projectCount}</div>
                  <div className="text-sm text-purple-800 mt-1">保存的项目</div>
                </div>
              </div>
              
              {stats.mostUsedTool && (
                <div className="mt-8">
                  <h4 className="text-md font-semibold mb-4">最常用工具</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <span className="text-2xl mr-3">{stats.mostUsedTool.icon}</span>
                    <div>
                      <h5 className="font-medium text-gray-900">{stats.mostUsedTool.name}</h5>
                      <p className="text-sm text-gray-500">使用了 {stats.mostUsedTool.usageCount} 次</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}