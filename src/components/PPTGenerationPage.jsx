import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Check, Loader2, FileText, AlertCircle, Download } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useSettingsStore from '../store/useSettingsStore';
import { analyzeFile } from '../services/documentAnalysis';
import { generatePPT } from '../services/pptGeneration';
import { exportToPPTX } from '../services/pptExport';

const PPTGenerationPage = ({ projectData, onBack }) => {
  const [step, setStep] = useState('analyzing'); // analyzing, confirm, generating, outline, rendering
  const [chatInput, setChatInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [userCommand, setUserCommand] = useState('总结提炼'); // 用户指令
  const { messages, addMessage, slides, setSlides } = useAppStore();
  const { openaiApiKey, groqApiKey, useRealAPI } = useSettingsStore();

  const [config, setConfig] = useState({
    theme: projectData?.template || 1,
    scene: '培训课程',
    pages: 10,
    animation: '淡入淡出',
    language: '中文',
  });

  const scenes = ['培训课程', '商务汇报', '产品发布', '教育讲座', '营销推广'];
  const animations = ['无动画', '淡入淡出', '滑动', '缩放', '旋转'];
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
          // 分析第一个文件（演示用）
          const file = projectData.files[0].file;

          // 构建 API Keys 对象
          const apiKeys = {};
          if (useRealAPI) {
            if (openaiApiKey) apiKeys.openai = openaiApiKey;
            if (groqApiKey) apiKeys.groq = groqApiKey;
          }

          // 使用用户输入的指令或默认指令
          const command = projectData.input || userCommand;
          const result = await analyzeFile(file, apiKeys, command);

          if (result.success) {
            setAnalysisResult(result);

            // 如果有转录文本，显示出来
            let messageContent = `✅ 文件分析完成！\n\n📄 文件名：${result.fileName}\n📊 文件类型：${result.fileType}\n\n`;

            if (result.transcription) {
              messageContent += `🎤 转录文本：\n${result.transcription.substring(0, 200)}${result.transcription.length > 200 ? '...' : ''}\n\n`;
            }

            messageContent += '已提取关键信息，请查看右侧确认。';

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
        // 没有文件，直接进入确认阶段
        setStep('confirm');
        addMessage({
          id: Date.now(),
          type: 'assistant',
          content: '请确认配置信息，然后开始生成演示文稿。',
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
      content: '正在生成演示文稿大纲...',
      timestamp: new Date().toISOString(),
    });

    try {
      // 使用 PPT 生成服务
      const apiKey = useRealAPI && openaiApiKey ? openaiApiKey : null;
      const result = await generatePPT(analysisResult, config, apiKey);

      if (result.success) {
        const generatedSlides = result.slides.map((item, index) => ({
          id: item.id || index + 1,
          title: item.title,
          content: item.content,
          layout: item.layout || 'content',
        }));

        setSlides(generatedSlides);
        setStep('outline');

        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: `✅ 大纲生成完成！共 ${generatedSlides.length} 页。\n\n您可以在右侧查看预览，或继续与我对话进行调整。`,
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

      // 模拟 AI 回复
      setTimeout(() => {
        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: '好的，我已经根据您的要求进行了调整。',
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    }
  };

  const handleExportPPT = async () => {
    addMessage({
      id: Date.now(),
      type: 'assistant',
      content: '正在生成 PPT 文件，请稍候...',
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await exportToPPTX(slides, config.theme, {
        title: projectData?.input || '演示文稿',
        subject: `${config.scene} - ${config.language}`,
      });

      if (result.success) {
        addMessage({
          id: Date.now() + 1,
          type: 'assistant',
          content: `✅ ${result.message}\n\n文件名：${result.fileName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addMessage({
        id: Date.now() + 2,
        type: 'assistant',
        content: `❌ 导出失败：${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResult || !analysisResult.content) return null;

    const { content } = analysisResult;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📝 文档摘要</h4>
          <p className="text-sm text-blue-800">{content.summary}</p>
        </div>

        {content.keyPoints && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 关键信息点</h4>
            <ul className="space-y-2">
              {content.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.scripts && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">💬 金牌话术</h4>
            <div className="space-y-3">
              {content.scripts.map((script, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-3">
                  <div className="text-xs font-medium text-purple-600 mb-1">{script.scene}</div>
                  <div className="text-sm text-gray-700 mb-1">"{script.script}"</div>
                  <div className="text-xs text-gray-500">💡 {script.logic}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Chat */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI 助手</h2>
              <p className="text-xs text-gray-500">
                {isAnalyzing ? '正在分析...' : '为您生成专业演示文稿'}
              </p>
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
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
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

      {/* Right Panel - Configuration/Preview */}
      <div className="flex-1 overflow-y-auto">
        {step === 'analyzing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">正在分析文件...</h3>
              <p className="text-gray-600">请稍候，AI 正在提取关键信息</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="max-w-4xl mx-auto px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">确认关键信息</h2>
            <p className="text-gray-600 mb-8">请确认以下配置和提取的信息，然后开始生成演示文稿</p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">分析出错</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 文件分析结果</h3>
                {renderAnalysisResults()}
              </div>
            )}

            {/* Configuration */}
            <div className="bg-white rounded-xl shadow-soft p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 生成配置</h3>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  主题模板
                </label>
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  已选择：模板 #{config.theme}
                </div>
              </div>

              {/* Scene */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  应用场景
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {scenes.map((scene) => (
                    <button
                      key={scene}
                      onClick={() => setConfig({ ...config, scene })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.scene === scene
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {scene}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  页数选择：{config.pages} 页
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={config.pages}
                  onChange={(e) => setConfig({ ...config, pages: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 页</span>
                  <span>30 页</span>
                </div>
              </div>

              {/* Animation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  动画效果
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {animations.map((animation) => (
                    <button
                      key={animation}
                      onClick={() => setConfig({ ...config, animation })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.animation === animation
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {animation}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  语言选择
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => setConfig({ ...config, language })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        config.language === language
                          ? 'bg-green-500 text-white shadow-md'
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
                {isAnalyzing ? '分析中...' : '✨ 确认并生成大纲'}
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">正在生成大纲...</h3>
              <p className="text-gray-600">AI 正在根据您的配置创建演示文稿结构</p>
            </div>
          </div>
        )}

        {step === 'outline' && (
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">演示文稿预览</h2>
                <p className="text-gray-600">共 {slides.length} 页 · 可通过对话调整</p>
              </div>
              <button
                onClick={handleExportPPT}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-glow transition-all flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>导出 PPTX</span>
              </button>
            </div>

            <div className="space-y-6">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-white rounded-xl shadow-soft p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">
                      幻灯片 {index + 1}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">编辑</button>
                      <button className="text-sm text-red-600 hover:text-red-700">删除</button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {slide.title}
                  </h3>
                  <div className="text-gray-700">
                    {slide.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PPTGenerationPage;
