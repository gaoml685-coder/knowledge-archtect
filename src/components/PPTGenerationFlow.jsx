import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  LoaderCircle,
  Send,
  Sparkles
} from 'lucide-react';
import './PPTGenerationFlow.css';

const TOTAL_SLIDES = 26;

const PPTGenerationFlow = ({ projectData, onBack }) => {
  const baseUrl = import.meta.env.BASE_URL;
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [outline, setOutline] = useState(null);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [generatingSlides, setGeneratingSlides] = useState([]);
  const [currentGeneratingSlide, setCurrentGeneratingSlide] = useState(0);
  const flowTimerRef = useRef(null);
  const delayedStepRef = useRef(null);
  const generationIntervalRef = useRef(null);

  const mockExtractedInfo = {
    theme: '门店客源管理实战',
    subtitle: '房产中介门店运营管理策略',
    scenario: '房地产经纪人门店内部培训、团队管理会议',
    pages: TOTAL_SLIDES,
    animation: '极简',
    language: '简体中文',
    template: `${baseUrl}demo-ppt/slides/001.png`,
    templates: [
      { id: 1, name: 'Green Modern Work Summary', preview: `${baseUrl}demo-ppt/slides/001.png` },
      { id: 2, name: 'Business style work summary', preview: `${baseUrl}demo-ppt/slides/001.png` },
      { id: 3, name: 'Minimal Business Plan', preview: `${baseUrl}demo-ppt/slides/001.png` },
      { id: 4, name: 'Simple Blue Business Style', preview: `${baseUrl}demo-ppt/slides/001.png` },
      { id: 5, name: 'Black Industry Trend Report', preview: `${baseUrl}demo-ppt/slides/001.png` },
      { id: 6, name: 'Orange Business Proposal', preview: `${baseUrl}demo-ppt/slides/001.png` }
    ]
  };

  const mockOutline = {
    title: '门店客源管理实战',
    subtitle: '房产中介门店运营管理策略',
    totalPages: TOTAL_SLIDES,
    sections: [
      {
        id: 1,
        title: '封面',
        slides: [{ id: 1, title: '门店客源管理实战', subtitle: '房产中介门店运营管理策略', content: '讲师：赵建嘉', type: 'cover' }]
      },
      {
        id: 2,
        title: '目录',
        slides: [
          {
            id: 2,
            title: '目录',
            content: [
              '1. 讲师与目录（第1-2页）',
              '2. 讲师与门店基础信息（第3-4页）',
              '3. 客源管理核心目的与目标拆解（第5-6页）',
              '4. 固定盘客日周历（第7-8页）',
              '5. 积分制管理（第9-10页）',
              '6. 客源分层管理策略（第11页）',
              '7. 客源核心管理动作（第12-13页）',
              '8. 店长深度参与策略（第14-15页）',
              '9. 客源管理总纲领（第16页）',
              '10. 结束页（第26页）'
            ],
            type: 'toc'
          }
        ]
      },
      {
        id: 3,
        title: '讲师与门店基础信息（1/2）',
        slides: [
          {
            id: 3,
            title: '讲师与门店基础信息',
            content: [
              '讲师：赵建嘉',
              '从业经历：2009年7月13日入职',
              '团队规模：锁定位置、工作地、居住、核心诉求'
            ],
            type: 'content'
          }
        ]
      },
      {
        id: 4,
        title: '讲师与门店基础信息（2/2）',
        slides: [{ id: 4, title: '经纪人人数与职责分工', content: '店长与经纪人的分工职责和执行标准', type: 'content' }]
      },
      {
        id: 5,
        title: '客源管理核心目的与目标拆解',
        slides: [
          { id: 5, title: '客源管理核心目的与目标拆解', content: '目标制定逻辑和业绩拆解公式', type: 'content' },
          { id: 6, title: '目标拆解与执行', content: '详细的目标拆解方法和执行标准', type: 'content' }
        ]
      },
      {
        id: 6,
        title: '固定盘客日周历',
        slides: [
          { id: 7, title: '固定盘客日周历（第7-8页）', content: '周一至周日的完整工作安排', type: 'content' },
          { id: 8, title: '周工作安排详情', content: '每日具体工作内容和时间安排', type: 'content' }
        ]
      },
      {
        id: 7,
        title: '积分制管理',
        slides: [
          { id: 9, title: '积分制管理（第9-10页）', content: '完整的目标效分标准表格和执行标准', type: 'content' },
          { id: 10, title: '积分制度详细规则', content: '积分获取、使用和兑换规则', type: 'content' }
        ]
      },
      { id: 8, title: '客源分层管理策略', slides: [{ id: 11, title: '客源分层管理策略', content: 'A/B/C类客户分层表格', type: 'content' }] },
      {
        id: 9,
        title: '客源核心管理动作',
        slides: [
          { id: 12, title: '客源核心管理动作（第12-13页）', content: '客源解析、3日暖期、IM沟通标准化', type: 'content' },
          { id: 13, title: '管理动作执行细节', content: '各项管理动作的具体执行方法', type: 'content' }
        ]
      },
      {
        id: 10,
        title: '店长深度参与策略',
        slides: [
          { id: 14, title: '店长深度参与策略（第14-15页）', content: '核心工作内容和限度要求', type: 'content' },
          { id: 15, title: '店长工作标准', content: '店长在客源管理中的具体职责', type: 'content' }
        ]
      },
      { id: 11, title: '客源管理总纲领', slides: [{ id: 16, title: '客源管理总纲领（第16页）', content: '找一张一通表一锁定图', type: 'content' }] },
      {
        id: 12,
        title: '补充案例与复盘',
        slides: [
          { id: 17, title: '案例复盘导入', content: '典型客户案例背景与目标定义', type: 'content' },
          { id: 18, title: '案例拆解（1/4）', content: '需求识别与关键触点分析', type: 'content' },
          { id: 19, title: '案例拆解（2/4）', content: '沟通策略与异议处理过程', type: 'content' },
          { id: 20, title: '案例拆解（3/4）', content: '房源匹配与路径优化', type: 'content' },
          { id: 21, title: '案例拆解（4/4）', content: '成交推进与复盘建议', type: 'content' },
          { id: 22, title: '团队执行清单', content: '门店周执行动作检查表', type: 'content' },
          { id: 23, title: '管理指标看板', content: '阶段性关键指标与阈值', type: 'content' },
          { id: 24, title: '风险预警机制', content: '异常信号识别与应对策略', type: 'content' },
          { id: 25, title: '行动计划总结', content: '30 天落地计划与责任分工', type: 'content' }
        ]
      },
      { id: 13, title: '结束页', slides: [{ id: 26, title: '谢谢', content: '门店客源管理实战', type: 'ending' }] }
    ]
  };

  const steps = [
    {
      id: 1,
      name: '上传文件',
      details: `文件名：${projectData?.fileName || '门店客源管理实战.pdf'}`
    },
    {
      id: 2,
      name: '输入指令',
      details: projectData?.instruction || '请根据上传的文档生成一份培训 PPT'
    },
    { id: 3, name: '提取信息', details: '识别文档结构、提取关键信息' },
    { id: 4, name: '生成大纲', details: '构建章节与页级结构' },
    { id: 5, name: '生成内容', details: '逐页生成内容与视觉布局' },
    { id: 6, name: '完成预览', details: '生成完成，可预览和下载' }
  ];

  const clearTimers = () => {
    if (flowTimerRef.current) {
      clearTimeout(flowTimerRef.current);
      flowTimerRef.current = null;
    }
    if (delayedStepRef.current) {
      clearTimeout(delayedStepRef.current);
      delayedStepRef.current = null;
    }
    if (generationIntervalRef.current) {
      clearInterval(generationIntervalRef.current);
      generationIntervalRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    flowTimerRef.current = setTimeout(() => {
      if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setCurrentStep(3);
      } else if (currentStep === 3) {
        setExtractedInfo(mockExtractedInfo);
        delayedStepRef.current = setTimeout(() => setCurrentStep(4), 1200);
      } else if (currentStep === 4) {
        setOutline(mockOutline);
        delayedStepRef.current = setTimeout(() => {
          const slideNames = mockOutline.sections.flatMap((section) =>
            section.slides.map((slide) => ({ id: slide.id, title: slide.title }))
          );
          setGeneratingSlides(slideNames);
          setCurrentGeneratingSlide(0);
          setCurrentStep(5);

          let currentSlide = 0;
          generationIntervalRef.current = setInterval(() => {
            if (currentSlide < TOTAL_SLIDES) {
              currentSlide += 1;
              setCurrentGeneratingSlide(currentSlide);
              return;
            }
            if (generationIntervalRef.current) {
              clearInterval(generationIntervalRef.current);
              generationIntervalRef.current = null;
            }
            setCurrentStep(6);
          }, 260);
        }, 1200);
      }
    }, 900);

    return () => {
      if (flowTimerRef.current) {
        clearTimeout(flowTimerRef.current);
        flowTimerRef.current = null;
      }
      if (delayedStepRef.current) {
        clearTimeout(delayedStepRef.current);
        delayedStepRef.current = null;
      }
    };
  }, [currentStep]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${baseUrl}demo-ppt/模拟生成_门店客源管理实战.pptx`;
    link.download = '模拟生成_门店客源管理实战.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenHTML = () => {
    window.open(`${baseUrl}html_门店客源管理实战/play.html#${previewSlide}`, '_blank');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        type: 'user',
        content: chatInput,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const inputText = chatInput;
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: `已收到：${inputText}。我会在下一轮生成中应用这个调整。`,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 450);
  };

  const renderStepBadge = (stepId) => {
    if (stepId < currentStep) {
      return (
        <span className="ppt-step-icon done">
          <CheckCircle2 className="w-4 h-4" />
        </span>
      );
    }
    if (stepId === currentStep) {
      return (
        <span className="ppt-step-icon running">
          <LoaderCircle className="w-4 h-4 animate-spin" />
        </span>
      );
    }
    return (
      <span className="ppt-step-icon pending">
        <Clock3 className="w-4 h-4" />
      </span>
    );
  };

  const renderBriefingPanel = () => (
    <div className="ppt-stage-panel">
      <div className="ppt-stage-heading">
        <h3>任务准备中</h3>
        <p>系统正在读取文档并整理输入指令。</p>
      </div>
      <div className="ppt-brief-grid">
        <div className="ppt-card">
          <h4>上传文件</h4>
          <div className="space-y-2">
            {(projectData?.files || []).length > 0 ? (
              projectData.files.map((file, index) => (
                <div key={index} className="ppt-file-item">
                  <span>{file.name}</span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))
            ) : (
              <div className="ppt-file-item">
                <span>{projectData?.fileName || '门店客源管理实战.pdf'}</span>
                <span>2.3 MB</span>
              </div>
            )}
          </div>
        </div>
        <div className="ppt-card">
          <h4>生成指令</h4>
          <p>{projectData?.instruction || '请根据上传文件生成一份专业的培训 PPT。'}</p>
        </div>
      </div>
    </div>
  );

  const renderExtractedPanel = () => (
    <div className="ppt-stage-panel">
      <div className="ppt-stage-heading">
        <h3>文档提取结果</h3>
        <p>已自动整理主题、场景和模板建议。</p>
      </div>
      {!extractedInfo ? (
        <div className="ppt-empty">
          <LoaderCircle className="w-6 h-6 animate-spin" />
          <span>正在提取信息...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="ppt-metric-row">
            <div className="ppt-metric-card">
              <span>主题</span>
              <strong>{extractedInfo.theme}</strong>
            </div>
            <div className="ppt-metric-card">
              <span>场景</span>
              <strong>{extractedInfo.scenario}</strong>
            </div>
          </div>
          <div className="ppt-metric-row">
            <div className="ppt-metric-card compact">
              <span>页数</span>
              <strong>{extractedInfo.pages} 页</strong>
            </div>
            <div className="ppt-metric-card compact">
              <span>动画</span>
              <strong>{extractedInfo.animation}</strong>
            </div>
            <div className="ppt-metric-card compact">
              <span>语言</span>
              <strong>{extractedInfo.language}</strong>
            </div>
          </div>
          <div className="ppt-template-row">
            {extractedInfo.templates.slice(0, 4).map((template, index) => (
              <div key={template.id} className={`ppt-template-card ${index === 0 ? 'active' : ''}`}>
                <img src={template.preview} alt={template.name} />
                <span>{template.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderOutlinePanel = () => (
    <div className="ppt-stage-panel">
      <div className="ppt-stage-heading">
        <h3>演示大纲（{outline?.totalPages || TOTAL_SLIDES} 页）</h3>
        <p>以下是自动编排后的章节结构。</p>
      </div>
      {!outline ? (
        <div className="ppt-empty">
          <LoaderCircle className="w-6 h-6 animate-spin" />
          <span>正在生成大纲...</span>
        </div>
      ) : (
        <div className="ppt-outline-list">
          {outline.sections.map((section, index) => (
            <div key={section.id} className="ppt-outline-item">
              <div className="ppt-outline-index">{index + 1}</div>
              <div>
                <h4>{section.title}</h4>
                <p>{section.slides.map((slide) => `第${slide.id}页 ${slide.title}`).join(' / ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGeneratingPanel = () => (
    <div className="ppt-stage-panel">
      <div className="ppt-stage-heading">
        <h3>正在生成演示文稿</h3>
        <p>系统正在按大纲逐页生成内容与版式。</p>
      </div>
      <div className="ppt-progress-wrap">
        <div className="ppt-progress-text">
          <span>生成进度</span>
          <strong>
            {currentGeneratingSlide} / {TOTAL_SLIDES}
          </strong>
        </div>
        <div className="ppt-progress-bar">
          <div style={{ width: `${(currentGeneratingSlide / TOTAL_SLIDES) * 100}%` }} />
        </div>
      </div>
      <div className="ppt-generating-list">
        {generatingSlides.map((slide, index) => {
          const isDone = index < currentGeneratingSlide;
          const isNow = index === currentGeneratingSlide;
          return (
            <div key={slide.id} className={`ppt-generating-item ${isDone ? 'done' : ''} ${isNow ? 'running' : ''}`}>
              <span>{slide.title}</span>
              {isDone && <CheckCircle2 className="w-4 h-4" />}
              {isNow && <LoaderCircle className="w-4 h-4 animate-spin" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPreviewPanel = () => (
    <div className="ppt-preview-shell">
      <div className="ppt-preview-toolbar">
        <span>
          第 {previewSlide + 1} 页 / 共 {TOTAL_SLIDES} 页
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="ppt-action-btn green">
            <Download className="w-4 h-4" />
            下载 PPTX
          </button>
          <button onClick={handleOpenHTML} className="ppt-action-btn blue">
            <FileText className="w-4 h-4" />
            HTML 版本
          </button>
        </div>
      </div>

      <div className="ppt-preview-stage">
        <div className="ppt-preview-frame">
          <img
            src={`${baseUrl}demo-ppt/slides/${String(previewSlide + 1).padStart(3, '0')}.png`}
            alt={`第 ${previewSlide + 1} 页预览`}
            className="ppt-preview-image"
          />
        </div>

        <button
          onClick={() => setPreviewSlide((prev) => Math.max(0, prev - 1))}
          disabled={previewSlide === 0}
          className="ppt-nav-btn left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPreviewSlide((prev) => Math.min(TOTAL_SLIDES - 1, prev + 1))}
          disabled={previewSlide === TOTAL_SLIDES - 1}
          className="ppt-nav-btn right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="ppt-thumbnail-track">
        {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
          <button
            key={index}
            onClick={() => setPreviewSlide(index)}
            className={`ppt-thumb ${index === previewSlide ? 'active' : ''}`}
          >
            <img src={`${baseUrl}demo-ppt/slides/${String(index + 1).padStart(3, '0')}.png`} alt={`第${index + 1}页`} />
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCenterPanel = () => {
    if (currentStep <= 2) return renderBriefingPanel();
    if (currentStep === 3) return renderExtractedPanel();
    if (currentStep === 4) return renderOutlinePanel();
    if (currentStep === 5) return renderGeneratingPanel();
    return renderPreviewPanel();
  };

  return (
    <div className="ppt-workspace">
      <header className="ppt-header">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="ppt-back-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1>PPT 生成流程</h1>
            <p>{projectData?.name || '新项目'}</p>
          </div>
        </div>
        <div className="ppt-status-pill">
          <Sparkles className="w-4 h-4" />
          <span>{currentStep < 6 ? 'AI 正在处理中' : '生成完成'}</span>
        </div>
      </header>

      <main className="ppt-layout">
        <aside className="ppt-left-panel">
          <div className="ppt-panel-title">生成步骤</div>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className={`ppt-step-card ${step.id === currentStep ? 'active' : ''}`}>
                <div className="flex items-start gap-3">
                  {renderStepBadge(step.id)}
                  <div className="flex-1 min-w-0">
                    <div className="ppt-step-name">{step.name}</div>
                    <div className="ppt-step-desc">{step.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="ppt-center-panel">{renderCenterPanel()}</section>

        <aside className="ppt-right-panel">
          <div className="ppt-panel-title">优化指令</div>
          <p className="ppt-right-tip">可输入调整需求，例如：第 3 页增加流程图，整体风格改为商务蓝。</p>
          <div className="ppt-chat-list">
            {chatMessages.length === 0 ? (
              <div className="ppt-empty-chat">这里会显示你与 AI 的迭代记录。</div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} className={`ppt-chat-item ${msg.type}`}>
                  <p>{msg.content}</p>
                  <span>{msg.timestamp}</span>
                </div>
              ))
            )}
          </div>
          <div className="ppt-chat-input-wrap">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="输入修改指令..."
            />
            <button onClick={handleSendMessage} disabled={!chatInput.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PPTGenerationFlow;
