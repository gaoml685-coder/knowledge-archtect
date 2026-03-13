import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Play, Pause, Download } from 'lucide-react';
import './PPTGenerationFlow.css';

const PodcastGenerationFlow = ({ projectData, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // 步骤定义
  const steps = [
    { id: 1, name: '文件解析', icon: '📄', details: '正在解析上传的文件...' },
    { id: 2, name: '文本转写', icon: '🎤', details: '正在将音频转写为文本...' },
    { id: 3, name: '播客脚本创作', icon: '✍️', details: '正在创作播客脚本...' },
    { id: 4, name: '播客生成', icon: '🎙️', details: '正在生成播客音频...' },
  ];

  // 模拟的播客脚本
  const mockScript = `【播客开场】

大家好，欢迎收听今天的房产观察播客。我是主持人小李。

今天我们要聊的话题是"回龙观杨东博选房博弈"。这是一个非常有意思的案例，涉及到北京回龙观地区的房产选择策略。

【正文部分】

回龙观作为北京北部的重要居住区，一直以来都是购房者关注的热点区域。杨东博在这里的选房经历，可以说是一场精彩的博弈。

首先，我们来看看回龙观的地理位置优势。它位于昌平区，紧邻地铁13号线和8号线，交通便利。周边配套设施完善，有大型商场、学校、医院等。

杨东博在选房时，主要考虑了以下几个因素：

第一，交通便利性。他选择了靠近地铁站的小区，这样上下班会更加方便。

第二，小区环境。他实地考察了多个小区，最终选择了绿化率高、物业管理好的小区。

第三，价格因素。通过对比多个房源，他找到了性价比最高的选择。

第四，未来发展潜力。回龙观地区正在进行城市更新，未来升值空间较大。

【总结】

通过这个案例，我们可以看到，选房不仅仅是看价格，更要综合考虑交通、环境、配套、未来发展等多个因素。

好了，今天的播客就到这里。感谢大家的收听，我们下期再见！`;

  // 自动推进流程
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // 发送聊天消息
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages(prev => [...prev, {
        type: 'user',
        content: chatInput,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]);

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'system',
          content: '收到您的修改指令，正在处理...',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);

      setChatInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 播放/暂停播客
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 下载脚本
  const handleDownloadScript = () => {
    const blob = new Blob([mockScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '播客脚本_回龙观杨东博选房博弈.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 渲染右侧预览内容
  const renderPreviewContent = () => {
    // 步骤 1-3：显示进度
    if (currentStep < 4) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1].name}
            </div>
            <div className="text-gray-600">
              {steps[currentStep - 1].details}
            </div>
          </div>
        </div>
      );
    }

    // 步骤 4：显示播客播放器和脚本
    return (
      <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
        {/* 播客播放器 */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">回龙观杨东博选房博弈</h2>

            {/* 音频播放器 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <audio
                ref={audioRef}
                src="/demo-podcast/回龙观杨东博选房博弈.mp3"
                onEnded={() => setIsPlaying(false)}
              />

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  )}
                </button>

                <div className="flex-1 text-white">
                  <div className="text-sm opacity-90">点击播放按钮收听播客</div>
                  <div className="text-xs opacity-75 mt-1">时长：约 5 分钟</div>
                </div>

                <button
                  onClick={handleDownloadScript}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载脚本
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 脚本内容 */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">播客脚本</h3>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
                {mockScript}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">播客生成流程</h1>
              <p className="text-sm text-gray-500 mt-1">
                {projectData?.files?.[0]?.name || '未命名项目'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <div className="grid grid-cols-[350px_1fr] h-full">
          {/* 左侧：流程步骤 + 对话框 */}
          <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* 流程步骤区域 */}
            <div className="flex-1 overflow-y-auto border-b border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">生成流程</h2>
                <div className="space-y-4">
                  {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isPending = step.id > currentStep;

                    return (
                      <div
                        key={step.id}
                        className={`rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : isCompleted
                            ? 'bg-green-50 border-2 border-green-200'
                            : 'bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <div className="text-xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className={`font-medium ${
                              isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                            }`}>
                              {step.name}
                            </div>
                          </div>
                          <div>
                            {isCompleted && <span className="text-green-600">✓</span>}
                            {isCurrent && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                            {isPending && <span className="text-gray-400">⏳</span>}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="px-3 pb-3 text-sm text-blue-800">
                            {step.details}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 对话框区域 */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
              {/* 对话历史 */}
              <div className="h-48 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-8">
                    输入修改指令与 AI 对话
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="text-sm">{msg.content}</div>
                        <div className={`text-xs mt-1 ${
                          msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                        }`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 输入框 */}
              <div className="p-3 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入修改指令..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="h-full overflow-hidden">
            {renderPreviewContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PodcastGenerationFlow;
