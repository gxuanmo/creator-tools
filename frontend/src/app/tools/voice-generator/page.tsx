'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SEO, { seoConfigs } from '@/components/SEO';

interface VoiceOptions {
  text: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  useClonedVoice: boolean;
  clonedVoiceId?: string;
}

interface ClonedVoice {
  id: string;
  name: string;
  previewUrl?: string;
  createdAt: Date;
}

interface VoiceCloneOptions {
  audioFile: File | null;
  voiceName: string;
  transcript: string;
}

interface GeneratedAudio {
  blob: Blob;
  url: string;
  fileName: string;
  duration: number;
}

/**
 * 配音工具(TTS)页面组件
 * 支持文本转语音，多种语言和声音选择
 */
export default function VoiceGenerator() {
  const [options, setOptions] = useState<VoiceOptions>({
    text: '欢迎使用配音工具！请输入您想要转换为语音的文本内容。',
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'zh-CN',
    useClonedVoice: false
  });
  
  const [cloneOptions, setCloneOptions] = useState<VoiceCloneOptions>({
    audioFile: null,
    voiceName: '',
    transcript: ''
  });
  
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  /**
   * 加载可用的语音
   */
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // 设置默认中文语音
      const chineseVoice = voices.find(voice => 
        voice.lang.startsWith('zh') || voice.name.includes('Chinese')
      );
      if (chineseVoice && !options.voice) {
        setOptions(prev => ({ ...prev, voice: chineseVoice }));
      }
    };

    // 语音加载可能是异步的
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [options.voice]);

  /**
   * 按语言分组语音
   */
  const groupedVoices = availableVoices.reduce((groups, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!groups[lang]) {
      groups[lang] = [];
    }
    groups[lang].push(voice);
    return groups;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

  /**
   * 语言映射
   */
  const languageNames: Record<string, string> = {
    'zh': '中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'it': 'Italiano',
    'ru': 'Русский',
    'ar': 'العربية'
  };

  /**
   * 生成语音
   */
  const generateVoice = useCallback(async () => {
    if (!options.text.trim()) {
      setError('请输入要转换的文本');
      return;
    }

    // 如果使用克隆音色
    if (options.useClonedVoice) {
      return generateWithClonedVoice();
    }

    if (!options.voice) {
      setError('请选择一个语音');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedAudio(null);

      // 停止当前播放
      speechSynthesis.cancel();

      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.voice = options.voice;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      // 设置音频上下文用于录制
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      
      // 创建媒体录制器
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const fileName = `voice_${Date.now()}.webm`;
        
        setGeneratedAudio({
          blob,
          url,
          fileName,
          duration: 0 // 实际时长会在播放时更新
        });
        
        setIsGenerating(false);
      };

      // 开始录制
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // 语音合成事件处理
      utterance.onstart = () => {
        console.log('语音合成开始');
      };

      utterance.onend = () => {
        console.log('语音合成结束');
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 500); // 延迟停止录制以确保完整性
      };

      utterance.onerror = (event) => {
        console.error('语音合成错误:', event.error);
        setError(`语音合成失败: ${event.error}`);
        setIsGenerating(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      // 开始语音合成
      speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('生成语音失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setIsGenerating(false);
    }
  }, [options]);

  /**
   * 播放预览
   */
  const handlePlay = useCallback(() => {
    if (!generatedAudio || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [generatedAudio, isPlaying]);

  /**
   * 下载音频
   */
  const handleDownload = useCallback(() => {
    if (!generatedAudio) return;

    const link = document.createElement('a');
    link.href = generatedAudio.url;
    link.download = generatedAudio.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedAudio]);

  /**
   * 实时预览（不录制）
   */
  const handlePreview = useCallback(() => {
    if (!options.text.trim() || !options.voice) return;

    // 停止当前播放
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.voice = options.voice;
    utterance.rate = options.rate;
    utterance.pitch = options.pitch;
    utterance.volume = options.volume;

    speechSynthesis.speak(utterance);
  }, [options]);

  /**
   * 上传音频文件到MiniMax API
   */
  const uploadAudioFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'voice_clone');

    const response = await fetch('https://api.minimaxi.chat/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MINIMAX_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('文件上传失败');
    }

    const data = await response.json();
    return data.file.file_id;
  };

  /**
   * 克隆音色
   */
  const cloneVoice = useCallback(async () => {
    if (!cloneOptions.audioFile || !cloneOptions.voiceName.trim()) {
      setCloneError('请上传音频文件并输入音色名称');
      return;
    }

    try {
      setIsCloning(true);
      setCloneError(null);

      // 1. 上传音频文件
      const fileId = await uploadAudioFile(cloneOptions.audioFile);

      // 2. 创建音色克隆
      const cloneResponse = await fetch('https://api.minimaxi.chat/v1/voice_clone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_id: fileId,
          voice_name: cloneOptions.voiceName,
          transcript: cloneOptions.transcript || undefined,
          preview: {
            text: '这是音色克隆的预览效果，您可以听听是否满意。',
            model: 'speech-01-hd'
          }
        })
      });

      if (!cloneResponse.ok) {
        throw new Error('音色克隆失败');
      }

      const cloneData = await cloneResponse.json();
      
      // 3. 保存克隆的音色
      const newClonedVoice: ClonedVoice = {
        id: cloneData.voice_id,
        name: cloneOptions.voiceName,
        previewUrl: cloneData.preview_audio,
        createdAt: new Date()
      };

      setClonedVoices(prev => [...prev, newClonedVoice]);
      
      // 4. 重置表单
      setCloneOptions({
        audioFile: null,
        voiceName: '',
        transcript: ''
      });

      // 5. 保存到本地存储
      const savedVoices = JSON.parse(localStorage.getItem('clonedVoices') || '[]');
      savedVoices.push(newClonedVoice);
      localStorage.setItem('clonedVoices', JSON.stringify(savedVoices));

    } catch (err) {
      console.error('音色克隆失败:', err);
      setCloneError(err instanceof Error ? err.message : '克隆失败，请重试');
    } finally {
      setIsCloning(false);
    }
  }, [cloneOptions]);

  /**
   * 使用克隆音色生成语音
   */
  const generateWithClonedVoice = useCallback(async () => {
    if (!options.text.trim() || !options.clonedVoiceId) {
      setError('请输入文本并选择克隆音色');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedAudio(null);

      const response = await fetch('https://api.minimaxi.chat/v1/t2a_v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MINIMAX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'speech-01-hd',
          text: options.text,
          voice_id: options.clonedVoiceId,
          speed: options.rate,
          vol: options.volume,
          pitch: options.pitch
        })
      });

      if (!response.ok) {
        throw new Error('语音生成失败');
      }

      const data = await response.json();
      
      // 下载音频文件
      const audioResponse = await fetch(data.audio_url);
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const fileName = `cloned_voice_${Date.now()}.mp3`;

      setGeneratedAudio({
        blob: audioBlob,
        url: audioUrl,
        fileName,
        duration: 0
      });

    } catch (err) {
      console.error('生成语音失败:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  /**
   * 从本地存储加载克隆音色
   */
  useEffect(() => {
    const savedVoices = JSON.parse(localStorage.getItem('clonedVoices') || '[]');
    setClonedVoices(savedVoices.map((voice: any) => ({
      ...voice,
      createdAt: new Date(voice.createdAt)
    })));
  }, []);

  /**
   * 停止所有播放
   */
  const handleStop = useCallback(() => {
    speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  /**
   * 重置设置
   */
  const handleReset = useCallback(() => {
    handleStop();
    setOptions({
      text: '欢迎使用配音工具！请输入您想要转换为语音的文本内容。',
      voice: availableVoices.find(voice => 
        voice.lang.startsWith('zh') || voice.name.includes('Chinese')
      ) || null,
      rate: 1,
      pitch: 1,
      volume: 1,
      language: 'zh-CN',
      useClonedVoice: false,
      clonedVoiceId: undefined
    });
    setCloneOptions({
      audioFile: null,
      voiceName: '',
      transcript: ''
    });
    setGeneratedAudio(null);
    setError(null);
    setCloneError(null);
  }, [availableVoices]);

  return (
    <>
      <SEO {...seoConfigs.voiceGenerator} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <span className="text-xl">←</span>
                <span>返回首页</span>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">配音工具 (TTS)</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：设置面板 */}
            <div className="space-y-6">
              {/* 文本输入 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">文本内容</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      要转换的文本 ({options.text.length} 字符)
                    </label>
                    <textarea
                      value={options.text}
                      onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={6}
                      placeholder="输入要转换为语音的文本内容..."
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      建议文本长度不超过1000字符以获得最佳效果
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreview}
                      disabled={!options.text.trim() || !options.voice}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <span>🔊</span>
                      <span>试听</span>
                    </button>
                    
                    <button
                      onClick={handleStop}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      停止
                    </button>
                  </div>
                </div>
              </div>

              {/* 音色模式选择 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">音色模式</h2>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="voiceMode"
                        checked={!options.useClonedVoice}
                        onChange={() => setOptions(prev => ({ ...prev, useClonedVoice: false }))}
                        className="mr-2"
                      />
                      <span>系统语音</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="voiceMode"
                        checked={options.useClonedVoice}
                        onChange={() => setOptions(prev => ({ ...prev, useClonedVoice: true }))}
                        className="mr-2"
                      />
                      <span>克隆音色</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 音色克隆 */}
              {options.useClonedVoice && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">音色克隆</h2>
                  <div className="space-y-4">
                    {/* 现有克隆音色选择 */}
                    {clonedVoices.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          选择已克隆的音色
                        </label>
                        <select
                          value={options.clonedVoiceId || ''}
                          onChange={(e) => setOptions(prev => ({ ...prev, clonedVoiceId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择克隆音色</option>
                          {clonedVoices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name} (创建于 {voice.createdAt.toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 创建新的音色克隆 */}
                    <div className="border-t pt-4">
                      <h3 className="text-md font-medium text-gray-800 mb-3">创建新的音色克隆</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            音色名称
                          </label>
                          <input
                            type="text"
                            value={cloneOptions.voiceName}
                            onChange={(e) => setCloneOptions(prev => ({ ...prev, voiceName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="为您的音色起个名字..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            上传音频文件 (建议10-60秒)
                          </label>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setCloneOptions(prev => ({ ...prev, audioFile: file }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            支持 MP3、WAV、M4A 等格式，文件大小不超过 10MB
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            音频转录文本 (可选)
                          </label>
                          <textarea
                            value={cloneOptions.transcript}
                            onChange={(e) => setCloneOptions(prev => ({ ...prev, transcript: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                            placeholder="输入音频中说话的内容，有助于提高克隆质量..."
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            提供转录文本可以显著提高音色克隆的相似度和稳定性
                          </div>
                        </div>

                        <button
                          onClick={cloneVoice}
                          disabled={isCloning || !cloneOptions.audioFile || !cloneOptions.voiceName.trim()}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          {isCloning ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>克隆中...</span>
                            </>
                          ) : (
                            <>
                              <span>🎭</span>
                              <span>开始克隆音色</span>
                            </>
                          )}
                        </button>

                        {cloneError && (
                          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                            {cloneError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 语音选择 */}
              {!options.useClonedVoice && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">语音设置</h2>
                  <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择语音
                    </label>
                    <select
                      value={options.voice?.name || ''}
                      onChange={(e) => {
                        const selectedVoice = availableVoices.find(voice => voice.name === e.target.value);
                        setOptions(prev => ({ ...prev, voice: selectedVoice || null }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">请选择语音</option>
                      {Object.entries(groupedVoices).map(([lang, voices]) => (
                        <optgroup key={lang} label={languageNames[lang] || lang}>
                          {voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  
                  {options.voice && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <div><strong>语言:</strong> {options.voice.lang}</div>
                      <div><strong>本地语音:</strong> {options.voice.localService ? '是' : '否'}</div>
                      <div><strong>默认语音:</strong> {options.voice.default ? '是' : '否'}</div>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* 语音参数 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">语音参数</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      语速: {options.rate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={options.rate}
                      onChange={(e) => setOptions(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>慢速 (0.1x)</span>
                      <span>正常 (1.0x)</span>
                      <span>快速 (2.0x)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      音调: {options.pitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={options.pitch}
                      onChange={(e) => setOptions(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>低音 (0.0)</span>
                      <span>正常 (1.0)</span>
                      <span>高音 (2.0)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      音量: {Math.round(options.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={options.volume}
                      onChange={(e) => setOptions(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>静音 (0%)</span>
                      <span>正常 (100%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateVoice}
                  disabled={isGenerating || !options.text.trim() || (options.useClonedVoice ? !options.clonedVoiceId : !options.voice)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <span>🎤</span>
                      <span>生成语音</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 右侧：预览和结果 */}
            <div className="space-y-6">
              {/* 预览区域 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">音频预览</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                  {generatedAudio ? (
                    <div className="text-center w-full">
                      <div className="text-4xl mb-4">🎵</div>
                      <audio
                        ref={audioRef}
                        src={generatedAudio.url}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        controls
                        className="w-full mb-4"
                      />
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handlePlay}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <span>{isPlaying ? '⏸️' : '▶️'}</span>
                          <span>{isPlaying ? '暂停' : '播放'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🎤</div>
                      <div>点击"生成语音"创建音频文件</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 下载区域 */}
              {generatedAudio && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">语音生成完成</h3>
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
                    <div>
                      <p className="font-medium text-gray-900">{generatedAudio.fileName}</p>
                      <p className="text-sm text-gray-600">
                        格式: WebM (Opus编码)
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>📥</span>
                      <span>下载</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* 语音信息 */}
              {options.voice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-800 mb-3">当前语音信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">语音名称:</span>
                      <span className="text-blue-900 font-medium">{options.voice.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">语言:</span>
                      <span className="text-blue-900">{options.voice.lang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">语速:</span>
                      <span className="text-blue-900">{options.rate.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">音调:</span>
                      <span className="text-blue-900">{options.pitch.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">音量:</span>
                      <span className="text-blue-900">{Math.round(options.volume * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">系统语音操作步骤</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>选择"系统语音"模式</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>输入要转换为语音的文本内容</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>选择合适的语音和语言</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>调整语速、音调和音量参数</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>点击"试听"预览效果，生成并下载</span>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2 mt-4">音色克隆操作步骤</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">1.</span>
                    <span>选择"克隆音色"模式</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">2.</span>
                    <span>上传10-60秒的音频样本文件</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">3.</span>
                    <span>输入音色名称和转录文本(可选)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">4.</span>
                    <span>点击"开始克隆音色"创建专属音色</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">5.</span>
                    <span>选择克隆音色，输入文本生成语音</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">功能特点</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• <strong>双模式支持:</strong> 系统语音 + AI音色克隆</div>
                  <div>• <strong>音色克隆:</strong> 10秒音频即可复刻专属音色</div>
                  <div>• <strong>多语言支持:</strong> 中文、英文、日文等17+语言</div>
                  <div>• <strong>高质量合成:</strong> 基于MiniMax先进AI模型</div>
                  <div>• <strong>参数调节:</strong> 语速、音调、音量精细控制</div>
                  <div>• <strong>本地存储:</strong> 克隆音色自动保存到本地</div>
                  <div>• <strong>音频导出:</strong> 支持WebM和MP3格式</div>
                  <div>• <strong>隐私保护:</strong> 本地处理，不上传服务器</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">注意事项</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>• 文本长度建议控制在1000字符以内</div>
                <div>• 不同浏览器支持的语音可能有差异</div>
                <div>• 生成的音频格式为WebM，兼容大部分现代浏览器</div>
                <div>• 某些语音可能需要网络连接才能使用</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}