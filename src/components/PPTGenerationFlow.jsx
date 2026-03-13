import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Send, FileText } from 'lucide-react';
import './PPTGenerationFlow.css';

const PPTGenerationFlow = ({ projectData, onBack }) => {
  const baseUrl = import.meta.env.BASE_URL;
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [outline, setOutline] = useState(null);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const iframeRef = useRef(null);

  // 模拟的提取信息
  const mockExtractedInfo = {
    theme: '门店客源管理实战',
    scenario: '房地产经纪人培训',
    pages: 17,
    animation: '简洁过渡',
    language: '中文',
    template: `${baseUrl}demo-ppt/slides/001.png`
  };

  // 模拟的大纲数据
  const mockOutline = {
    title: '门店客源管理实战',
    sections: [
      {
        title: '第一章：客源管理概述',
        slides: [
          { title: '什么是客源管理', content: '客源管理的定义与重要性' },
          { title: '客源管理的核心要素', content: '客户获取、维护、转化' },
        ]
      },
      {
        title: '第二章：客源获取策略',
        slides: [
          { title: '线上获客渠道', content: '社交媒体、搜索引擎、内容营销' },
          { title: '线下获客方法', content: '门店活动、社区推广、转介绍' },
          { title: '客源质量评估', content: '客户画像、需求分析、意向度判断' },
        ]
      },
      {
        title: '第三章：客户关系维护',
        slides: [
          { title: '客户分级管理', content: 'A/B/C 级客户分类与跟进策略' },
          { title: '客户跟进技巧', content: '沟通频率、内容设计、价值提供' },
          { title: '客户信任建立', content: '专业形象、服务态度、案例展示' },
        ]
      },
      {
        title: '第四章：成交转化技巧',
        slides: [
          { title: '需求挖掘与匹配', content: '深度需求分析、精准房源推荐' },
          { title: '异议处理方法', content: '常见异议类型、应对话术、案例分析' },
          { title: '促成交易策略', content: '时机把握、优惠设计、签约流程' },
        ]
      },
      {
        title: '第五章：数据分析与优化',
        slides: [
          { title: '客源数据统计', content: '来源渠道、转化率、成交周期' },
          { title: '效果评估指标', content: 'ROI、客户满意度、复购率' },
          { title: '持续优化方案', content: '流程改进、工具升级、团队培训' },
        ]
      }
    ]
  };

  // 生成步骤定义
  const steps = [
    {
      id: 1,
      name: '上传文件',
      icon: '📁',
      details: `文件名：${projectData?.fileName || '门店客源管理实战.pdf'}\n文件大小：2.3 MB\n上传时间：${new Date().toLocaleString('zh-CN')}`
    },
    {
      id: 2,
      name: '输入指令',
      icon: '✍️',
      details: projectData?.instruction || '请根据上传的文档生成一份培训PPT，要求：\n- 提取核心知识点\n- 适合房地产经纪人培训场景\n- 包含实战案例和技巧\n- 页数控制在15-20页'
    },
    {
      id: 3,
      name: '提取信息',
      icon: '🔍',
      details: '正在分析文档内容...\n识别文档结构、提取关键信息'
    },
    {
      id: 4,
      name: '生成大纲',
      icon: '📋',
      details: '正在生成PPT大纲结构...'
    },
    {
      id: 5,
      name: '生成内容',
      icon: '✨',
      details: '正在生成PPT内容...'
    },
    {
      id: 6,
      name: '完成预览',
      icon: '✅',
      details: 'PPT生成完成！\n共17页，可以预览和下载'
    }
  ];

  // 自动推进流程（全自动，无需手动确认）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setCurrentStep(3);
      } else if (currentStep === 3) {
        setExtractedInfo(mockExtractedInfo);
        // 自动推进到步骤4
        setTimeout(() => setCurrentStep(4), 1500);
      } else if (currentStep === 4) {
        setOutline(mockOutline);
        // 自动推进到步骤5
        setTimeout(() => setCurrentStep(5), 1500);
      } else if (currentStep === 5) {
        setTimeout(() => setCurrentStep(6), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // 下载 PPT
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${baseUrl}demo-ppt/模拟生成_门店客源管理实战.pptx`;
    link.download = '模拟生成_门店客源管理实战.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 在新窗口打开 HTML - 全屏模式
  const handleOpenHTML = () => {
    const newWindow = window.open(`${baseUrl}demo-ppt/play.html`, '_blank');
    if (newWindow) {
      // 尝试全屏（需要用户交互）
      setTimeout(() => {
        if (newWindow.document.documentElement.requestFullscreen) {
          newWindow.document.documentElement.requestFullscreen().catch(() => {
            // 全屏失败时静默处理
          });
        }
      }, 100);
    }
  };

  // 处理翻页 - 使用 hash 方式同步 iframe
  const handlePrevSlide = () => {
    const newSlide = Math.max(0, previewSlide - 1);
    setPreviewSlide(newSlide);
    if (iframeRef.current) {
      iframeRef.current.src = `${baseUrl}demo-ppt/play.html#${newSlide}`;
    }
  };

  const handleNextSlide = () => {
    const newSlide = Math.min(16, previewSlide + 1);
    setPreviewSlide(newSlide);
    if (iframeRef.current) {
      iframeRef.current.src = `${baseUrl}demo-ppt/play.html#${newSlide}`;
    }
  };

  // 发送聊天消息
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages(prev => [...prev, {
        type: 'user',
        content: chatInput,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }]);

      // 模拟 AI 回复
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'assistant',
          content: '好的，我已收到您的修改指令，正在处理中...',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);

      setChatInput('');
    }
  };

  // 处理回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 渲染右侧预览内容
  const renderPreviewContent = () => {
    // 步骤 1-2：显示任务信息
    if (currentStep <= 2) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">上传的文件</h3>
              <div className="space-y-2">
                {projectData?.files?.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📄</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">生成指令</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{projectData?.instruction || '请根据上传的文件生成一份专业的 PPT'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 步骤 3：显示提取的关键信息
    if (currentStep === 3) {
      return (
        <div className="h-full flex flex-col bg-gray-50">
          {/* 内容区 - flex-1 可滚动 */}
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">提取的关键信息</h3>

            {extractedInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">主题</div>
                    <div className="text-lg font-semibold text-gray-900">{extractedInfo.theme}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">场景</div>
                    <div className="text-lg font-semibold text-gray-900">{extractedInfo.scenario}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">页数</div>
                    <div className="text-lg font-semibold text-gray-900">{extractedInfo.pages} 页</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">动画效果</div>
                    <div className="text-lg font-semibold text-gray-900">{extractedInfo.animation}</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">语言</div>
                    <div className="text-lg font-semibold text-gray-900">{extractedInfo.language}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-600 mb-3">选择的模板</div>
                  <div className="border-2 border-blue-500 rounded-lg overflow-hidden inline-block">
                    <img
                      src={extractedInfo.template}
                      alt="模板封面"
                      className="w-80 h-auto"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 步骤 4：显示大纲
    if (currentStep === 4) {
      return (
        <div className="h-full flex flex-col bg-gray-50">
          {/* 内容区 - flex-1 可滚动 */}
          <div className="flex-1 overflow-y-auto p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">PPT 大纲</h3>

            {outline ? (
              <div className="space-y-6">
                <div className="text-xl font-bold text-blue-600 mb-4">{outline.title}</div>

                {outline.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border-l-4 border-blue-500 pl-6 py-2">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h4>
                    <div className="space-y-2">
                      {section.slides.map((slide, slideIndex) => (
                        <div key={slideIndex} className="pl-4 py-2 bg-gray-50 rounded">
                          <div className="font-medium text-gray-800">{slide.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{slide.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 步骤 5-6：显示 PPT 预览
    if (currentStep >= 5) {
      const totalSlides = 17;
      const isComplete = currentStep === 6;

      return (
        <div className="h-full flex flex-col bg-gray-900">
          {/* 顶部操作栏 */}
          {isComplete && (
            <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-300">
                第 {previewSlide + 1} 页 / 共 {totalSlides} 页
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载 PPTX
                </button>
                <button
                  onClick={handleOpenHTML}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  HTML 版本
                </button>
              </div>
            </div>
          )}

          {/* PPT 预览区 - 使用 calc 计算高度，为缩略图留出空间 */}
          <div
            className="flex-shrink-0 bg-gray-900 flex items-center justify-center p-4 relative"
            style={{ height: isComplete ? 'calc(100% - 160px)' : '100%' }}
          >
            {/* 16:9 容器 */}
            <div className="relative w-full h-full max-w-full" style={{ aspectRatio: '16/9' }}>
              {isComplete ? (
                <iframe
                  ref={iframeRef}
                  src={`${baseUrl}demo-ppt/play.html#${previewSlide}`}
                  className="w-full h-full border-0 rounded shadow-2xl"
                  title="PPT Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">正在生成 PPT...</div>
                  </div>
                </div>
              )}
            </div>

            {/* 翻页按钮 - 绝对定位在预览区 */}
            {isComplete && (
              <>
                <button
                  onClick={handlePrevSlide}
                  disabled={previewSlide === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  disabled={previewSlide === totalSlides - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* 缩略图区域 - 固定高度，确保可见 */}
          {isComplete && (
            <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 px-4 py-3" style={{ height: '110px' }}>
              <div className="flex items-center gap-2 overflow-x-auto h-full">
                {Array.from({ length: totalSlides }).map((_, index) => {
                  const isCurrent = index === previewSlide;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setPreviewSlide(index);
                        if (iframeRef.current) {
                          iframeRef.current.src = `${baseUrl}demo-ppt/play.html#${index}`;
                        }
                      }}
                      className={`flex-shrink-0 rounded border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-600 hover:border-blue-400'
                      } bg-white overflow-hidden`}
                      style={{ width: '120px', height: '68px' }}
                    >
                      <img
                        src={`${baseUrl}demo-ppt/slides/${String(index + 1).padStart(3, '0')}.png`}
                        alt={`第 ${index + 1} 页`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">第 ${index + 1} 页</div>`;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* 顶部导航栏 - 固定高度 */}
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
              <h1 className="text-xl font-semibold text-gray-900">PPT 生成流程</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {projectData?.name || '新项目'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 - 占据剩余空间 */}
      <main className="flex-1 overflow-hidden">
        <div className="grid grid-cols-[350px_1fr] h-full">
          {/* 左侧：流程步骤 + 对话框 */}
          <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* 流程步骤区域 - flex-1 自动填充，可滚动 */}
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

                      {/* 显示详细内容 */}
                      {(isCurrent || isCompleted) && step.details && (
                        <div className={`px-3 pb-3 text-sm whitespace-pre-line ${
                          isCurrent ? 'text-blue-800' : 'text-gray-700'
                        }`}>
                          {step.id === 3 && extractedInfo ? (
                            <div className="space-y-1">
                              <div>主题：{extractedInfo.theme}</div>
                              <div>场景：{extractedInfo.scenario}</div>
                              <div>页数：{extractedInfo.pages} 页</div>
                              <div>动画：{extractedInfo.animation}</div>
                              <div>语言：{extractedInfo.language}</div>
                            </div>
                          ) : step.id === 4 && outline ? (
                            <div className="space-y-2">
                              <div className="font-semibold text-blue-700">{outline.title}</div>
                              {outline.sections.map((section, idx) => (
                                <div key={idx} className="pl-2">
                                  <div className="font-medium">{section.title}</div>
                                  {section.slides.map((slide, sIdx) => (
                                    <div key={sIdx} className="pl-3 text-xs text-gray-600">
                                      • {slide.title}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ) : step.id === 5 && currentStep >= 5 ? (
                            <div>正在生成第 {Math.min(currentStep === 6 ? 17 : Math.floor(Math.random() * 17) + 1, 17)} 页...</div>
                          ) : (
                            step.details
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>

            {/* 对话框区域 - 固定底部，始终显示 */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
              {/* 对话历史 - 固定高度，可滚动 */}
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

              {/* 输入框 - 固定在对话框底部 */}
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

export default PPTGenerationFlow;
