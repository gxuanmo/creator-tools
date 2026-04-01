'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

/**
 * 性能监控组件
 * 监控页面加载和渲染性能
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // 只在开发环境显示性能指标
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // 获取内存使用情况（如果支持）
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      // 获取网络连接类型（如果支持）
      const connection = (navigator as any).connection;
      const connectionType = connection?.effectiveType;
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined,
        connectionType
      });
    };

    // 等待页面完全加载后测量性能
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // 键盘快捷键切换显示
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowMetrics(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !metrics || !showMetrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">性能指标</span>
        <button
          onClick={() => setShowMetrics(false)}
          className="text-gray-300 hover:text-white ml-2"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>加载时间:</span>
          <span className={metrics.loadTime > 3000 ? 'text-red-400' : metrics.loadTime > 1000 ? 'text-yellow-400' : 'text-green-400'}>
            {metrics.loadTime}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>首次渲染:</span>
          <span className={metrics.renderTime > 2000 ? 'text-red-400' : metrics.renderTime > 1000 ? 'text-yellow-400' : 'text-green-400'}>
            {metrics.renderTime}ms
          </span>
        </div>
        
        {metrics.memoryUsage && (
          <div className="flex justify-between">
            <span>内存使用:</span>
            <span className={metrics.memoryUsage > 50 ? 'text-red-400' : metrics.memoryUsage > 25 ? 'text-yellow-400' : 'text-green-400'}>
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}
        
        {metrics.connectionType && (
          <div className="flex justify-between">
            <span>网络:</span>
            <span>{metrics.connectionType}</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400">
        Ctrl+Shift+P 切换显示
      </div>
    </div>
  );
}

/**
 * 性能监控Hook
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: Math.round(nav.loadEventEnd - nav.loadEventStart),
          }));
        }
        
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            renderTime: Math.round(entry.startTime),
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });
    
    return () => observer.disconnect();
  }, []);

  return metrics;
}
