'use client';

import { useEffect, useCallback, useRef } from 'react';

// 快捷键配置接口
export interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

// 预定义的快捷键
export const DEFAULT_SHORTCUTS = {
  OPEN_WORKSPACE: {
    key: 'w',
    ctrlKey: true,
    description: '打开工作空间',
  },
  SEARCH_TOOLS: {
    key: 'k',
    ctrlKey: true,
    description: '搜索工具',
  },
  GO_HOME: {
    key: 'h',
    ctrlKey: true,
    description: '返回首页',
  },
  TOGGLE_FAVORITES: {
    key: 'f',
    ctrlKey: true,
    description: '切换收藏状态',
  },
  QUICK_SAVE: {
    key: 's',
    ctrlKey: true,
    description: '快速保存',
  },
  HELP: {
    key: '?',
    shiftKey: true,
    description: '显示帮助',
  },
} as const;

export function useKeyboardShortcuts() {
  const shortcutsRef = useRef<Map<string, ShortcutConfig>>(new Map());
  const isEnabledRef = useRef(true);

  // 生成快捷键的唯一标识符
  const getShortcutId = useCallback((config: Omit<ShortcutConfig, 'action' | 'description'>) => {
    if (!config.key) return '';
    const modifiers = [];
    if (config.ctrlKey) modifiers.push('ctrl');
    if (config.altKey) modifiers.push('alt');
    if (config.shiftKey) modifiers.push('shift');
    if (config.metaKey) modifiers.push('meta');
    return `${modifiers.join('+')}+${config.key.toLowerCase()}`;
  }, []);

  // 检查快捷键是否匹配
  const isShortcutMatch = useCallback((event: KeyboardEvent, config: ShortcutConfig) => {
    if (!event.key || !config.key) return false;
    const key = event.key.toLowerCase();
    const configKey = config.key.toLowerCase();
    
    return (
      key === configKey &&
      !!event.ctrlKey === !!config.ctrlKey &&
      !!event.altKey === !!config.altKey &&
      !!event.shiftKey === !!config.shiftKey &&
      !!event.metaKey === !!config.metaKey
    );
  }, []);

  // 注册快捷键
  const registerShortcut = useCallback((config: ShortcutConfig) => {
    const id = getShortcutId(config);
    shortcutsRef.current.set(id, config);
    
    return () => {
      shortcutsRef.current.delete(id);
    };
  }, [getShortcutId]);

  // 注销快捷键
  const unregisterShortcut = useCallback((config: Omit<ShortcutConfig, 'action' | 'description'>) => {
    const id = getShortcutId(config);
    shortcutsRef.current.delete(id);
  }, [getShortcutId]);

  // 启用/禁用快捷键
  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  // 获取所有已注册的快捷键
  const getRegisteredShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  // 格式化快捷键显示文本
  const formatShortcut = useCallback((config: Omit<ShortcutConfig, 'action' | 'description'>) => {
    const parts = [];
    
    // 在 Mac 上使用 Cmd，其他系统使用 Ctrl
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (config.ctrlKey) {
      parts.push(isMac ? '⌘' : 'Ctrl');
    }
    if (config.altKey) {
      parts.push(isMac ? '⌥' : 'Alt');
    }
    if (config.shiftKey) {
      parts.push(isMac ? '⇧' : 'Shift');
    }
    if (config.metaKey) {
      parts.push(isMac ? '⌘' : 'Meta');
    }
    
    parts.push(config.key.toUpperCase());
    
    return parts.join(isMac ? '' : '+');
  }, []);

  // 处理键盘事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabledRef.current) return;
    
    // 如果焦点在输入框、文本域或可编辑元素上，则不处理快捷键
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return;
    }

    // 遍历所有注册的快捷键
    for (const config of shortcutsRef.current.values()) {
      if (isShortcutMatch(event, config)) {
        if (config.preventDefault !== false) {
          event.preventDefault();
        }
        config.action();
        break;
      }
    }
  }, [isShortcutMatch]);

  // 绑定键盘事件
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    registerShortcut,
    unregisterShortcut,
    setEnabled,
    getRegisteredShortcuts,
    formatShortcut,
  };
}

// 快捷键帮助组件的数据
export function useShortcutHelp() {
  const { getRegisteredShortcuts, formatShortcut } = useKeyboardShortcuts();
  
  const getShortcutList = useCallback(() => {
    const shortcuts = getRegisteredShortcuts();
    return shortcuts.map(config => ({
      shortcut: formatShortcut(config),
      description: config.description,
    }));
  }, [getRegisteredShortcuts, formatShortcut]);

  return {
    getShortcutList,
  };
}