interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * 加载组件
 * 提供统一的加载状态显示
 */
export default function Loading({ 
  size = 'md', 
  text = '加载中...', 
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div 
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        ></div>
        {text && (
          <span className={`text-gray-600 ${textSizeClasses[size]}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 页面级加载组件
 */
export function PageLoading({ text = '页面加载中...' }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  );
}

/**
 * 卡片级加载组件
 */
export function CardLoading({ text = '处理中...' }: { text?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Loading size="md" text={text} />
    </div>
  );
}

/**
 * 按钮加载状态组件
 */
export function ButtonLoading({ text = '处理中...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      <span>{text}</span>
    </div>
  );
}