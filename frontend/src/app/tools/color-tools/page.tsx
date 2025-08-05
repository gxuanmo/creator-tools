'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import { useToast } from '@/components/Toast';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: Date;
}

/**
 * 色彩工具箱页面
 * 提供颜色转换、调色板生成、颜色提取等功能
 */
export default function ColorToolsPage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'palette' | 'picker' | 'extractor'>('converter');
  const [currentColor, setCurrentColor] = useState('#3B82F6');
  const [colorInfo, setColorInfo] = useState<ColorInfo | null>(null);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const toast = useToast();
  
  // 调色板生成
  const [paletteType, setPaletteType] = useState<'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic'>('complementary');
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  
  // 图片颜色提取
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * 颜色格式转换函数
   */
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    
    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  /**
   * 更新颜色信息
   */
  const updateColorInfo = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    
    setColorInfo({ hex, rgb, hsl, hsv, cmyk });
  }, []);

  /**
   * 生成调色板
   */
  const generatePalette = useCallback(() => {
    const baseColor = hexToRgb(currentColor);
    const hsl = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
    let colors: string[] = [];
    
    switch (paletteType) {
      case 'monochromatic':
        // 单色调色板 - 不同明度
        for (let i = 0; i < 5; i++) {
          const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
          colors.push(hslToHex(hsl.h, hsl.s, lightness));
        }
        break;
        
      case 'analogous':
        // 类似色调色板 - 相邻色相
        for (let i = 0; i < 5; i++) {
          const hue = (hsl.h + (i - 2) * 30 + 360) % 360;
          colors.push(hslToHex(hue, hsl.s, hsl.l));
        }
        break;
        
      case 'complementary':
        // 互补色调色板
        colors = [
          currentColor,
          hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          hslToHex(hsl.h, Math.max(20, hsl.s - 30), hsl.l),
          hslToHex((hsl.h + 180) % 360, Math.max(20, hsl.s - 30), hsl.l),
          hslToHex(hsl.h, hsl.s, Math.max(20, hsl.l - 30))
        ];
        break;
        
      case 'triadic':
        // 三角色调色板
        colors = [
          currentColor,
          hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
          hslToHex(hsl.h, Math.max(20, hsl.s - 20), hsl.l),
          hslToHex((hsl.h + 120) % 360, Math.max(20, hsl.s - 20), hsl.l)
        ];
        break;
        
      case 'tetradic':
        // 四角色调色板
        colors = [
          currentColor,
          hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
          hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.max(20, hsl.l - 20))
        ];
        break;
    }
    
    setPaletteColors(colors);
  }, [currentColor, paletteType]);

  /**
   * HSL转HEX
   */
  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  /**
   * 从图片提取颜色
   */
  const extractColorsFromImage = useCallback((file: File) => {
    setIsExtracting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 设置画布尺寸
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 提取颜色
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData.data, 8);
        
        setExtractedColors(colors);
        setIsExtracting(false);
        toast.success('颜色提取完成');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * 提取主要颜色
   */
  const extractDominantColors = (imageData: Uint8ClampedArray, numColors: number): string[] => {
    const colorMap = new Map<string, number>();
    
    // 采样像素（每隔10个像素采样一次以提高性能）
    for (let i = 0; i < imageData.length; i += 40) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      
      // 跳过透明像素
      if (a < 128) continue;
      
      // 量化颜色（减少颜色数量）
      const quantizedR = Math.floor(r / 32) * 32;
      const quantizedG = Math.floor(g / 32) * 32;
      const quantizedB = Math.floor(b / 32) * 32;
      
      const hex = `#${quantizedR.toString(16).padStart(2, '0')}${quantizedG.toString(16).padStart(2, '0')}${quantizedB.toString(16).padStart(2, '0')}`;
      
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    
    // 按频率排序并返回前N个颜色
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, numColors)
      .map(([color]) => color);
  };

  /**
   * 保存调色板
   */
  const savePalette = useCallback(() => {
    if (paletteColors.length === 0) {
      toast.error('请先生成调色板');
      return;
    }
    
    const name = prompt('请输入调色板名称:');
    if (!name) return;
    
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name,
      colors: [...paletteColors],
      createdAt: new Date()
    };
    
    setPalettes(prev => [newPalette, ...prev]);
    toast.success('调色板保存成功');
  }, [paletteColors]);

  /**
   * 复制颜色值
   */
  const copyColor = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast.success(`已复制 ${color}`);
    } catch (error) {
      toast.error('复制失败');
    }
  }, []);



  // 初始化颜色信息
  useEffect(() => {
    updateColorInfo(currentColor);
  }, [currentColor, updateColorInfo]);

  // 自动生成调色板
  useEffect(() => {
    if (activeTab === 'palette') {
      generatePalette();
    }
  }, [activeTab, generatePalette]);

  return (
    <Layout>
      <SEO 
        title="色彩工具箱 - Creator Tools"
        description="专业的颜色工具集合，包含颜色转换、调色板生成、颜色提取等功能"
        keywords={['颜色转换', '调色板', '颜色提取', 'HEX转RGB', 'HSL', 'CMYK']}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎨 色彩工具箱
          </h1>
          <p className="text-lg text-gray-600">
            专业的颜色工具集合，颜色转换、调色板生成、颜色提取一站式解决
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="flex flex-wrap justify-center mb-8">
          {[
            { key: 'converter', label: '颜色转换', icon: '🔄' },
            { key: 'palette', label: '调色板生成', icon: '🎨' },
            { key: 'picker', label: '颜色选择器', icon: '🎯' },
            { key: 'extractor', label: '图片取色', icon: '📸' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`mx-2 mb-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* 颜色转换器 */}
        {activeTab === 'converter' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 颜色输入 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                颜色输入
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    颜色选择器
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <div
                      className="w-16 h-16 rounded-lg border border-gray-300"
                      style={{ backgroundColor: currentColor }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HEX 值
                  </label>
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setCurrentColor(value);
                      }
                    }}
                    placeholder="#3B82F6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 颜色信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                颜色信息
              </h3>
              
              {colorInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HEX
                      </label>
                      <div 
                        className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                        onClick={() => copyColor(colorInfo.hex)}
                      >
                        {colorInfo.hex.toUpperCase()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RGB
                      </label>
                      <div 
                        className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                        onClick={() => copyColor(`rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`)}
                      >
                        {colorInfo.rgb.r}, {colorInfo.rgb.g}, {colorInfo.rgb.b}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSL
                      </label>
                      <div 
                        className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                        onClick={() => copyColor(`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`)}
                      >
                        {colorInfo.hsl.h}°, {colorInfo.hsl.s}%, {colorInfo.hsl.l}%
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HSV
                      </label>
                      <div 
                        className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                        onClick={() => copyColor(`hsv(${colorInfo.hsv.h}, ${colorInfo.hsv.s}%, ${colorInfo.hsv.v}%)`)}
                      >
                        {colorInfo.hsv.h}°, {colorInfo.hsv.s}%, {colorInfo.hsv.v}%
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CMYK
                      </label>
                      <div 
                        className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                        onClick={() => copyColor(`cmyk(${colorInfo.cmyk.c}%, ${colorInfo.cmyk.m}%, ${colorInfo.cmyk.y}%, ${colorInfo.cmyk.k}%)`)}
                      >
                        {colorInfo.cmyk.c}%, {colorInfo.cmyk.m}%, {colorInfo.cmyk.y}%, {colorInfo.cmyk.k}%
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    💡 点击任意颜色值即可复制到剪贴板
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 调色板生成器 */}
        {activeTab === 'palette' && (
          <div className="space-y-8">
            {/* 调色板类型选择 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                调色板类型
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { type: 'monochromatic', label: '单色调', desc: '同色相不同明度' },
                  { type: 'analogous', label: '类似色', desc: '相邻色相组合' },
                  { type: 'complementary', label: '互补色', desc: '对比色组合' },
                  { type: 'triadic', label: '三角色', desc: '120°间隔色相' },
                  { type: 'tetradic', label: '四角色', desc: '90°间隔色相' }
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setPaletteType(type as any)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paletteType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 基础颜色选择 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                基础颜色
              </h3>
              
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
                />
                <div>
                  <div className="font-medium">{currentColor.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">选择基础颜色生成调色板</div>
                </div>
                <button
                  onClick={generatePalette}
                  className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新生成
                </button>
              </div>
            </div>

            {/* 生成的调色板 */}
            {paletteColors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    生成的调色板
                  </h3>
                  <button
                    onClick={savePalette}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    保存调色板
                  </button>
                </div>
                
                <div className="grid grid-cols-5 gap-4">
                  {paletteColors.map((color, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-full h-20 rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => copyColor(color)}
                      />
                      <div className="text-sm font-medium mt-2">{color.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 保存的调色板 */}
            {palettes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  保存的调色板 ({palettes.length})
                </h3>
                
                <div className="space-y-4">
                  {palettes.map((palette) => (
                    <div key={palette.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{palette.name}</h4>
                        <div className="text-sm text-gray-500">
                          {palette.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {palette.colors.map((color, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="w-full h-12 rounded border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                              style={{ backgroundColor: color }}
                              onClick={() => copyColor(color)}
                            />
                            <div className="text-xs mt-1">{color}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 颜色选择器 */}
        {activeTab === 'picker' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              高级颜色选择器
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className="w-48 h-48 mx-auto rounded-lg border border-gray-300 mb-4"
                    style={{ backgroundColor: currentColor }}
                  />
                  <div className="text-lg font-medium">{currentColor.toUpperCase()}</div>
                </div>
                
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-full h-16 rounded-lg border border-gray-300 cursor-pointer"
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">常用颜色</h4>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
                    '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
                    '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
                    '#800000', '#804000', '#808000', '#408000',
                    '#008000', '#008040', '#008080', '#004080',
                    '#000080', '#400080', '#800080', '#800040',
                    '#000000', '#404040', '#808080', '#C0C0C0',
                    '#FFFFFF', '#FFE0E0', '#E0FFE0', '#E0E0FF'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图片取色器 */}
        {activeTab === 'extractor' && (
          <div className="space-y-8">
            {/* 图片上传 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                上传图片提取颜色
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) extractColorsFromImage(file);
                  }}
                  className="hidden"
                />
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-600 mb-4">
                  点击选择图片或拖拽图片到此处
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isExtracting ? '提取中...' : '选择图片'}
                </button>
              </div>
            </div>

            {/* 提取的颜色 */}
            {extractedColors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  提取的主要颜色
                </h3>
                
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {extractedColors.map((color, index) => (
                    <div key={index} className="text-center">
                      <div
                        className="w-full h-16 rounded-lg border border-gray-200 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => copyColor(color)}
                      />
                      <div className="text-xs font-medium mt-2">{color.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  💡 点击颜色块复制颜色值到剪贴板
                </p>
              </div>
            )}

            {/* 隐藏的画布用于图片处理 */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📖 使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">功能特点：</h4>
              <ul className="space-y-1">
                <li>• <strong>颜色转换</strong> - 支持HEX、RGB、HSL、HSV、CMYK格式</li>
                <li>• <strong>调色板生成</strong> - 5种专业配色方案</li>
                <li>• <strong>颜色选择器</strong> - 直观的颜色选择界面</li>
                <li>• <strong>图片取色</strong> - 从图片中提取主要颜色</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">使用技巧：</h4>
              <ul className="space-y-1">
                <li>• 点击任意颜色值可快速复制</li>
                <li>• 调色板可保存供后续使用</li>
                <li>• 支持拖拽上传图片提取颜色</li>
                <li>• 所有操作均在本地完成，保护隐私</li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </Layout>
  );
}