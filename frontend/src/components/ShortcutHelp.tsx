'use client';

import React from 'react';
import { useShortcutHelp } from '../hooks/useKeyboardShortcuts';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  const { getShortcutList } = useShortcutHelp();
  const shortcuts = getShortcutList();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">快捷键帮助</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              使用以下快捷键可以更高效地使用创作者工具箱：
            </p>
          </div>

          {shortcuts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">⌨️</div>
              <p>当前页面没有可用的快捷键</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 全局快捷键 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">全局快捷键</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">打开工作空间</span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                      Ctrl+W
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">搜索工具</span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                      Ctrl+K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">返回首页</span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                      Ctrl+H
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">显示帮助</span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                      Shift+?
                    </kbd>
                  </div>
                </div>
              </div>

              {/* 工具特定快捷键 */}
              {shortcuts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">当前页面快捷键</h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-700">{shortcut.description}</span>
                        <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                          {shortcut.shortcut}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 通用操作提示 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">通用操作</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">关闭弹窗</span>
                    <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                      Esc
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">页面滚动</span>
                    <div className="flex space-x-1">
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        ↑
                      </kbd>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        ↓
                      </kbd>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        Page Up
                      </kbd>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        Page Down
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">选择文本</span>
                    <div className="flex space-x-1">
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        Ctrl+A
                      </kbd>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        Ctrl+C
                      </kbd>
                      <kbd className="px-2 py-1 text-sm font-mono bg-white border border-gray-300 rounded shadow-sm">
                        Ctrl+V
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">提示：</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 快捷键在输入框中不会生效</li>
                  <li>• 在 Mac 系统上，Ctrl 键对应 Cmd 键</li>
                  <li>• 按 Esc 键可以关闭大多数弹窗</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}