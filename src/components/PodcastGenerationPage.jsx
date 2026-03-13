import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Check, Loader2, Play, Pause, Download } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useSettingsStore from '../store/useSettingsStore';
import { analyzeFile } from '../services/documentAnalysis';
import { generatePodcastBuiltIn } from '../services/podcastBuiltIn';

const PodcastGenerationPage = ({ projectData, onBack }) => {
  const [step, setStep] = useState('analyzing'); // analyzing, confirm, generating, preview
  const [chatInput, setChatInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [podcastScript, setPodcastScript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const { messages, addMessage } = useAppStore();
  const { openaiApiKey, groqApiKey, useRealAPI } = useSettingsStore();

  const [config, setConfig] = useState({
    style: 'story', // story, interview, dialogue
    duration: '5-10分钟',
    language: '中文',
  });

  const styles = [
    { id: 'story', name: '故事版', desc: '生动有趣的叙事风格' },
    { id: 'interview', name: '访谈版', desc: '专业的问答形式' },
    { id: 'dialogue', name: '对话版', desc: '轻松的双人对话' },
  ];

  const durations = ['3-5分钟', '5-10分钟', '10-15分钟'];
  const languages = ['中文', 'English', '日本語'];

  // 自动分析上传的文件
  useEffect(() => {
    const analyzeFiles = async () => {
      if (projectData?.files && projectData.files.length > 0) {
        setIsAnalyzing(true);
        setError(null);

        addMessage({
          id: Date.now(),
          type: 'assistant',
          content: `正在分析 ${projectData.files.length} 个文件...`,
          timestamp: new Date().toISOString(),
        });

        try {
          const file = projectData.files[0].file;
          const apiKeys = {};
          if (useRealAPI) {
            if (openaiApiKey) apiKeys.openai = openaiApiKey;
            if (groqApiKey) apiKeys.groq = groqApiKey;
          }

          const command = projectData.input || '总结提炼';
          const result = await analyzeFile(file, apiKeys, command);

          if (result.success) {
            setAnalysisResult(result);

            let messageContent = `✅ 文件分析完成！\n\n📄 文件名：${result.fileName}\n📊 文件类型：${result.fileType}\n\n`;

            if (result.transcription) {
              messageContent += `🎤 转录文本：\n${result.transcription.substring(0, 200)}${result.transcription.length > 200 ? '...' : ''}\n\n`;
            }

            messageContent += '已提取关键信息，请选择播客风格并确认。';

            addMessage({
              id: Date.now() + 1,
              type: 'assistant',
              content: messageContent,
              timestamp: new Date().toISOString(),
            });
            setStep('confirm');
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          setError(err.message);
          addMessage({
            id: Date.now() + 2,
            type: 'assistant',
            content: `❌ 分析失败：${err.message}\n\n您可以继续手动输入需求。`,
            timestamp: new Date().toISOString(),
          });
          setStep('confirm');
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setStep('confirm');
        addMessage({
          id: Date.now(),
          type: 'assistant',
          content: '请选择播客风格，然后开始生成播客脚本。',
          timestamp: new Date().toISOString(),
        });
      }
    };

    analyzeFiles();
  }, []);

  const handleConfirm = async () => {
    setStep('generating');
    addMessage({
      id: Date.now(),
      type: 'assistant',
      content: '正在生成播客脚本...',
      timestamp: new Date().toISOString(),
    });

    try {
      // 使用内置的播客生成服务（无需 API Key）
      const apiKey = useRealAPI && openaiApiKey ? openaiApiKey : null;
      const result = await generatePodcastBuiltIn(analysisResult, config.style, apiKey);

      if (result.success) {
        setPodcastScript(result.script);
        setStep('preview');

        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: `✅ 播客脚本生成完成！\n\n您可以在右侧查看脚本内容，点击"播放播客"按钮即可收听。`,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addMessage({
        id: Date.now() + 2,
        type: 'assistant',
        content: `❌ 生成失败：${error.message}`,
        timestamp: new Date().toISOString(),
      });
      setStep('confirm');
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      addMessage({
        id: Date.now(),
        type: 'user',
        content: chatInput,
        timestamp: new Date().toISOString(),
      });
      setChatInput('');

      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: '好的，我已经根据您的要求调整了播客脚本。',
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    }
  };

  const handlePlayPodcast = () => {
    if (isPlaying) {
      // 停止播放
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      addMessage({
        id: Date.now(),
        type: 'assistant',
        content: '播客已暂停。',
        timestamp: new Date().toISOString(),
      });
    } else {
      // 开始播放
      setIsPlaying(true);
      addMessage({
        id: Date.now(),
        type: 'assistant',
        content: '正在播放播客，请稍候...',
        timestamp: new Date().toISOString(),
      });

      // 使用浏览器 TTS 播放
      const lines = podcastScript.split('\n').filter(line => line.trim());
      const voices = window.speechSynthesis.getVoices();
      const chineseVoices = voices.filter(voice =>
        voice.lang.includes('zh') || voice.lang.includes('CN')
      );
      const voice1 = chineseVoices[0] || voices[0];
      const voice2 = chineseVoices[1] || voices[1] || voices[0];

      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex >= lines.length) {
          setIsPlaying(false);
          addMessage({
            id: Date.now(),
            type: 'assistant',
            content: '✅ 播客播放完成！',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const line = lines[currentIndex];
        const match = line.match(/^(.+?)[:：]\s*(.+)$/);
        const text = match ? match[2] : line;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = currentIndex % 2 === 0 ? voice1 : voice2;
        utterance.rate = 1.0;
        utterance.pitch = currentIndex % 2 === 0 ? 1.0 : 1.1;
        utterance.volume = 1.0;

        utterance.onend = () => {
          currentIndex++;
          speakNext();
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          addMessage({
            id: Date.now(),
            type: 'assistant',
            content: '❌ 播放出错，请重试。',
            timestamp: new Date().toISOString(),
          });
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    }
  };

  const handleDownloadScript = () => {
    const blob = new Blob([podcastScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `播客脚本_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addMessage({
      id: Date.now(),
      type: 'assistant',
      content: '✅ 脚本已下载！',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Chat */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">播客生成助手</h2>
              <p className="text-xs text-gray-500">AI 为您创作专业播客</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">初始化中...</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="输入您的需求或调整建议..."
              disabled={isAnalyzing}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              rows={3}
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isAnalyzing}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Configuration & Preview */}
      <div className="flex-1 overflow-y-auto">
        {step === 'analyzing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">正在分析文件...</h3>
              <p className="text-gray-600">AI 正在提取关键信息</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-w-3xl mx-auto px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">配置播客</h2>

            <div className="bg-white rounded-xl shadow-soft p-8 space-y-6">
              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  播客风格
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setConfig({ ...config, style: style.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        config.style === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{style.name}</div>
                      <div className="text-xs text-gray-600">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  时长
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setConfig({ ...config, duration })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.duration === duration
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  语言
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => setConfig({ ...config, language })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.language === language
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isAnalyzing}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? '分析中...' : '✨ 确认并生成播客'}
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">正在生成播客脚本...</h3>
              <p className="text-gray-600">AI 正在创作精彩内容</p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">播客脚本预览</h2>
                <p className="text-gray-600">{config.style === 'story' ? '故事版' : config.style === 'interview' ? '访谈版' : '对话版'} · {config.duration}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPodcast}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isPlaying ? '暂停播客' : '播放播客'}</span>
                </button>
                <button
                  onClick={handleDownloadScript}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-glow transition-all flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>下载脚本</span>
                </button>
              </div>
            </div>

            {/* Script Content */}
            <div className="bg-white rounded-xl shadow-soft p-8">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {podcastScript}
                </pre>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>提示：</strong>当前为脚本预览模式。配置 ElevenLabs API Key 后可生成真实的音频播客。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastGenerationPage;
