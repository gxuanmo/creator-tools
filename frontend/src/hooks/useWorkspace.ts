'use client';

import { useState, useEffect, useCallback } from 'react';

// 工具使用历史记录接口
export interface ToolHistory {
  id: string;
  name: string;
  href: string;
  icon: string;
  lastUsed: number;
  usageCount: number;
}

// 收藏的工具接口
export interface FavoriteTool {
  id: string;
  name: string;
  href: string;
  icon: string;
  addedAt: number;
}

// 工作空间项目接口
export interface WorkspaceProject {
  id: string;
  name: string;
  description?: string;
  toolId: string;
  data: any; // 工具特定的数据
  createdAt: number;
  updatedAt: number;
}

// 工作空间状态接口
export interface WorkspaceState {
  history: ToolHistory[];
  favorites: FavoriteTool[];
  projects: WorkspaceProject[];
  recentProjects: WorkspaceProject[];
}

const STORAGE_KEYS = {
  HISTORY: 'creator-tools-history',
  FAVORITES: 'creator-tools-favorites',
  PROJECTS: 'creator-tools-projects',
} as const;

const MAX_HISTORY_ITEMS = 20;
const MAX_RECENT_PROJECTS = 10;

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>({
    history: [],
    favorites: [],
    projects: [],
    recentProjects: [],
  });

  // 从localStorage加载数据
  const loadFromStorage = useCallback(() => {
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
      const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
      const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
      
      // 按最后使用时间排序最近项目
      const recentProjects = [...projects]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENT_PROJECTS);

      setState({
        history,
        favorites,
        projects,
        recentProjects,
      });
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    }
  }, []);

  // 保存到localStorage
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }, []);

  // 添加工具使用历史
  const addToHistory = useCallback((tool: { id: string; name: string; href: string; icon: string }) => {
    setState(prev => {
      const existingIndex = prev.history.findIndex(item => item.id === tool.id);
      let newHistory: ToolHistory[];

      if (existingIndex >= 0) {
        // 更新现有记录
        newHistory = [...prev.history];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          lastUsed: Date.now(),
          usageCount: newHistory[existingIndex].usageCount + 1,
        };
      } else {
        // 添加新记录
        const newItem: ToolHistory = {
          ...tool,
          lastUsed: Date.now(),
          usageCount: 1,
        };
        newHistory = [newItem, ...prev.history];
      }

      // 限制历史记录数量
      newHistory = newHistory
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .slice(0, MAX_HISTORY_ITEMS);

      saveToStorage(STORAGE_KEYS.HISTORY, newHistory);
      return { ...prev, history: newHistory };
    });
  }, [saveToStorage]);

  // 添加到收藏夹
  const addToFavorites = useCallback((tool: { id: string; name: string; href: string; icon: string }) => {
    setState(prev => {
      const exists = prev.favorites.some(item => item.id === tool.id);
      if (exists) return prev;

      const newFavorite: FavoriteTool = {
        ...tool,
        addedAt: Date.now(),
      };
      const newFavorites = [newFavorite, ...prev.favorites];
      
      saveToStorage(STORAGE_KEYS.FAVORITES, newFavorites);
      return { ...prev, favorites: newFavorites };
    });
  }, [saveToStorage]);

  // 从收藏夹移除
  const removeFromFavorites = useCallback((toolId: string) => {
    setState(prev => {
      const newFavorites = prev.favorites.filter(item => item.id !== toolId);
      saveToStorage(STORAGE_KEYS.FAVORITES, newFavorites);
      return { ...prev, favorites: newFavorites };
    });
  }, [saveToStorage]);

  // 检查是否已收藏
  const isFavorite = useCallback((toolId: string) => {
    return state.favorites.some(item => item.id === toolId);
  }, [state.favorites]);

  // 保存项目
  const saveProject = useCallback((project: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => {
      const now = Date.now();
      const newProject: WorkspaceProject = {
        ...project,
        id: `project_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      const newProjects = [newProject, ...prev.projects];
      const recentProjects = [...newProjects]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENT_PROJECTS);

      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return {
        ...prev,
        projects: newProjects,
        recentProjects,
      };
    });
  }, [saveToStorage]);

  // 更新项目
  const updateProject = useCallback((projectId: string, updates: Partial<WorkspaceProject>) => {
    setState(prev => {
      const newProjects = prev.projects.map(project => 
        project.id === projectId 
          ? { ...project, ...updates, updatedAt: Date.now() }
          : project
      );

      const recentProjects = [...newProjects]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENT_PROJECTS);

      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return {
        ...prev,
        projects: newProjects,
        recentProjects,
      };
    });
  }, [saveToStorage]);

  // 删除项目
  const deleteProject = useCallback((projectId: string) => {
    setState(prev => {
      const newProjects = prev.projects.filter(project => project.id !== projectId);
      const recentProjects = [...newProjects]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_RECENT_PROJECTS);

      saveToStorage(STORAGE_KEYS.PROJECTS, newProjects);
      return {
        ...prev,
        projects: newProjects,
        recentProjects,
      };
    });
  }, [saveToStorage]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
    saveToStorage(STORAGE_KEYS.HISTORY, []);
  }, [saveToStorage]);

  // 清空收藏夹
  const clearFavorites = useCallback(() => {
    setState(prev => ({ ...prev, favorites: [] }));
    saveToStorage(STORAGE_KEYS.FAVORITES, []);
  }, [saveToStorage]);

  // 获取工具统计信息
  const getToolStats = useCallback(() => {
    const totalUsage = state.history.reduce((sum, item) => sum + item.usageCount, 0);
    const mostUsedTool = state.history.reduce((prev, current) => 
      prev.usageCount > current.usageCount ? prev : current, state.history[0]
    );

    return {
      totalTools: state.history.length,
      totalUsage,
      favoriteCount: state.favorites.length,
      projectCount: state.projects.length,
      mostUsedTool,
    };
  }, [state]);

  // 初始化时加载数据
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    ...state,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    saveProject,
    updateProject,
    deleteProject,
    clearHistory,
    clearFavorites,
    getToolStats,
    loadFromStorage,
  };
}