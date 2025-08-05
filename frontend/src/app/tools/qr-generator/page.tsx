'use client';

import { useState, useRef, useCallback } from 'react';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';
import QRCode from 'qrcode';

interface QRCodeItem {
  id: string;
  type: 'text' | 'url' | 'wifi' | 'contact';
  content: string;
  displayText: string;
  dataUrl: string;
  size: number;
  color: string;
  backgroundColor: string;
  createdAt: Date;
}

interface WiFiConfig {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

interface ContactConfig {
  name: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
}

/**
 * 二维码生成器页面
 * 支持文本、URL、WiFi、联系人等多种类型的二维码生成
 */
export default function QRGeneratorPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [activeType, setActiveType] = useState<'text' | 'url' | 'wifi' | 'contact'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  
  // 基础设置
  const [size, setSize] = useState(200);
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  
  // 文本/URL
  const [textContent, setTextContent] = useState('');
  
  // WiFi配置
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });
  
  // 联系人配置
  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  /**
   * 生成WiFi二维码内容
   */
  const generateWiFiContent = (config: WiFiConfig): string => {
    const { ssid, password, security, hidden } = config;
    return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
  };

  /**
   * 生成联系人二维码内容（vCard格式）
   */
  const generateContactContent = (config: ContactConfig): string => {
    const { name, phone, email, organization, url } = config;
    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    if (name) vcard += `FN:${name}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (organization) vcard += `ORG:${organization}\n`;
    if (url) vcard += `URL:${url}\n`;
    
    vcard += 'END:VCARD';
    return vcard;
  };

  /**
   * 获取当前内容和显示文本
   */
  const getCurrentContent = (): { content: string; displayText: string } => {
    switch (activeType) {
      case 'text':
      case 'url':
        return {
          content: textContent,
          displayText: textContent
        };
      case 'wifi':
        return {
          content: generateWiFiContent(wifiConfig),
          displayText: `WiFi: ${wifiConfig.ssid}`
        };
      case 'contact':
        return {
          content: generateContactContent(contactConfig),
          displayText: `联系人: ${contactConfig.name || '未命名'}`
        };
      default:
        return { content: '', displayText: '' };
    }
  };

  /**
   * 生成二维码
   */
  const generateQRCode = useCallback(async () => {
    const { content, displayText } = getCurrentContent();
    
    if (!content.trim()) {
      toast.error('请输入内容');
      return;
    }
    
    // 验证URL格式
    if (activeType === 'url' && !isValidUrl(content)) {
      toast.error('请输入有效的URL（需包含http://或https://）');
      return;
    }
    
    // 验证WiFi配置
    if (activeType === 'wifi' && !wifiConfig.ssid.trim()) {
      toast.error('请输入WiFi名称');
      return;
    }
    
    // 验证联系人配置
    if (activeType === 'contact' && !contactConfig.name.trim() && !contactConfig.phone.trim() && !contactConfig.email.trim()) {
      toast.error('请至少输入姓名、电话或邮箱');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const dataUrl = await QRCode.toDataURL(content, {
        width: size,
        color: {
          dark: color,
          light: backgroundColor
        },
        errorCorrectionLevel: 'M',
        margin: 2
      });
      
      const newQRCode: QRCodeItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: activeType,
        content,
        displayText,
        dataUrl,
        size,
        color,
        backgroundColor,
        createdAt: new Date()
      };
      
      setQrCodes(prev => [newQRCode, ...prev]);
      toast.success('二维码生成成功');
      
      // 清空表单（可选）
      if (activeType === 'text' || activeType === 'url') {
        // setTextContent('');
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
      toast.error('生成二维码失败');
    } finally {
      setIsGenerating(false);
    }
  }, [activeType, textContent, wifiConfig, contactConfig, size, color, backgroundColor]);

  /**
   * 验证URL格式
   */
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  /**
   * 下载二维码
   */
  const downloadQRCode = useCallback((qrCode: QRCodeItem) => {
    const link = document.createElement('a');
    link.href = qrCode.dataUrl;
    link.download = `qrcode_${qrCode.type}_${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('二维码下载已开始');
  }, []);

  /**
   * 复制二维码内容
   */
  const copyContent = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('内容已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  }, []);

  /**
   * 删除二维码
   */
  const deleteQRCode = useCallback((id: string) => {
    setQrCodes(prev => prev.filter(qr => qr.id !== id));
    toast.info('二维码已删除');
  }, []);

  /**
   * 清空所有二维码
   */
  const clearAllQRCodes = useCallback(() => {
    setQrCodes([]);
    toast.info('已清空所有二维码');
  }, []);



  /**
   * 渲染输入表单
   */
  const renderInputForm = () => {
    switch (activeType) {
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文本内容
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="输入要生成二维码的文本内容..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        );
        
      case 'url':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              网址链接
            </label>
            <input
              type="url"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              请输入完整的URL，包含 http:// 或 https://
            </p>
          </div>
        );
        
      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WiFi名称 (SSID) *
              </label>
              <input
                type="text"
                value={wifiConfig.ssid}
                onChange={(e) => setWifiConfig(prev => ({ ...prev, ssid: e.target.value }))}
                placeholder="输入WiFi网络名称"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={wifiConfig.password}
                onChange={(e) => setWifiConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="输入WiFi密码（开放网络可留空）"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                安全类型
              </label>
              <select
                value={wifiConfig.security}
                onChange={(e) => setWifiConfig(prev => ({ ...prev, security: e.target.value as 'WPA' | 'WEP' | 'nopass' }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">无密码</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hidden"
                checked={wifiConfig.hidden}
                onChange={(e) => setWifiConfig(prev => ({ ...prev, hidden: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="hidden" className="text-sm text-gray-700">
                隐藏网络
              </label>
            </div>
          </div>
        );
        
      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={contactConfig.name}
                onChange={(e) => setContactConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入联系人姓名"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                电话号码
              </label>
              <input
                type="tel"
                value={contactConfig.phone}
                onChange={(e) => setContactConfig(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="输入电话号码"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={contactConfig.email}
                onChange={(e) => setContactConfig(prev => ({ ...prev, email: e.target.value }))}
                placeholder="输入邮箱地址"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司/组织
              </label>
              <input
                type="text"
                value={contactConfig.organization}
                onChange={(e) => setContactConfig(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="输入公司或组织名称"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                网站
              </label>
              <input
                type="url"
                value={contactConfig.url}
                onChange={(e) => setContactConfig(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <p className="text-xs text-gray-500">
              至少需要填写姓名、电话或邮箱中的一项
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Layout>
      <SEO 
        title="二维码生成器 - Creator Tools"
        description="在线二维码生成工具，支持文本、URL、WiFi、联系人等多种类型，自定义样式，批量生成"
        keywords={['二维码生成器', 'QR码', 'WiFi二维码', '联系人二维码', '在线生成']}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📱 二维码生成器
          </h1>
          <p className="text-lg text-gray-600">
            支持文本、URL、WiFi、联系人等多种类型的二维码生成
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 生成器面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 类型选择 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                选择二维码类型
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: 'text', label: '文本', icon: '📝' },
                  { type: 'url', label: '网址', icon: '🔗' },
                  { type: 'wifi', label: 'WiFi', icon: '📶' },
                  { type: 'contact', label: '联系人', icon: '👤' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      activeType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 内容输入 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                输入内容
              </h3>
              
              {renderInputForm()}
            </div>

            {/* 样式设置 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                样式设置
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尺寸: {size}px
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="50"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    前景色
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景色
                  </label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? '生成中...' : '🎯 生成二维码'}
            </button>
          </div>

          {/* 历史记录 */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  生成历史 ({qrCodes.length})
                </h3>
                {qrCodes.length > 0 && (
                  <button
                    onClick={clearAllQRCodes}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    清空全部
                  </button>
                )}
              </div>
              
              {qrCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📱</div>
                  <p>还没有生成任何二维码</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {qrCodes.map((qrCode) => (
                    <div key={qrCode.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={qrCode.dataUrl}
                          alt="二维码"
                          className="w-16 h-16 border border-gray-200 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {qrCode.displayText}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {qrCode.type.toUpperCase()} • {qrCode.size}px
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => downloadQRCode(qrCode)}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                              下载
                            </button>
                            <button
                              onClick={() => copyContent(qrCode.content)}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                            >
                              复制
                            </button>
                            <button
                              onClick={() => deleteQRCode(qrCode.id)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📖 使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">支持类型：</h4>
              <ul className="space-y-1">
                <li>• <strong>文本</strong> - 纯文本内容</li>
                <li>• <strong>网址</strong> - 网站链接，扫码直接访问</li>
                <li>• <strong>WiFi</strong> - 网络配置，扫码自动连接</li>
                <li>• <strong>联系人</strong> - vCard格式，扫码添加联系人</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">使用技巧：</h4>
              <ul className="space-y-1">
                <li>• 调整尺寸以适应不同使用场景</li>
                <li>• 保持前景色和背景色有足够对比度</li>
                <li>• WiFi二维码支持各种安全类型</li>
                <li>• 联系人信息会保存为vCard格式</li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </Layout>
  );
}