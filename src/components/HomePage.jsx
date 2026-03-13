import { useState, useEffect, useRef } from 'react';
import { Sparkles, FileText, Mic, FolderOpen, Upload, Send, Presentation, Radio, FileSearch, Settings, Store } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import SettingsModal from './SettingsModal';
import ParticleBackground from './ParticleBackground';

const HomePage = ({ onStartProject, onGoToSkills, selectedSkill, onClearSkill }) => {
  const [selectedMode, setSelectedMode] = useState('ppt');
  const [inputValue, setInputValue] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { uploadedFiles, addFile } = useAppStore();
  const textareaRef = useRef(null);

  // 当选中技能时，滚动到输入框并聚焦
  useEffect(() => {
    if (selectedSkill && textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        textareaRef.current.focus();
      }, 500);
    }
  }, [selectedSkill]);

  const modes = [
    { id: 'ppt', name: 'PPT', icon: Presentation, color: 'bg-blue-500' },
    { id: 'podcast', name: '播客', icon: Radio, color: 'bg-purple-500' },
    { id: 'organize', name: '素材整理', icon: FolderOpen, color: 'bg-green-500' },
  ];

  const quickCommands = [
    { id: 'doc-to-ppt', label: '文档转演示文稿', icon: FileText },
    { id: 'audio-to-podcast', label: '将录音文件转为故事版播客', icon: Mic },
    { id: 'extract-scripts', label: '提取录音中的金牌销话术', icon: FileSearch },
  ];

  const pptTemplates = [
    { id: 1, name: '营销计划', preview: '/templates/营销计划.png' },
    { id: 2, name: '个人简介', preview: '/templates/个人简介.png' },
    { id: 3, name: '高校精品课', preview: '/templates/高校精品课.png' },
    { id: 4, name: '工作总结', preview: '/templates/工作总结.png' },
    { id: 5, name: '行业报告', preview: '/templates/行业报告.png' },
    { id: 6, name: '高端产品设计方案', preview: '/templates/高端产品设计方案.png' },
    { id: 7, name: '橙色业务提案', preview: '/templates/橙色业务提案.png' },
    { id: 8, name: '精简商业计划书', preview: '/templates/精简商业计划书.png' },
    { id: 9, name: '10008', preview: '/templates/10008.png' },
  ];

  const recentProjects = [
    { id: 1, name: '销售培训课件', type: 'PPT', date: '2024-03-10', thumbnail: '/projects/销售培训课件封面.png' },
    { id: 2, name: '产品发布播客', type: '播客', date: '2024-03-09', thumbnail: '/projects/产品发布播客封面.png' },
    { id: 3, name: '客户案例整理', type: '素材', date: '2024-03-08', thumbnail: '/projects/客户案例整理封面.png' },
  ];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // 清空之前的文件，每次上传都是新任务
    useAppStore.setState({ uploadedFiles: [] });

    // 添加新上传的文件
    files.forEach(file => {
      addFile({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    });
  };

  const handleQuickCommand = (commandId) => {
    setInputValue(quickCommands.find(c => c.id === commandId)?.label || '');
  };

  const handleStart = () => {
    if (inputValue.trim() || uploadedFiles.length > 0) {
      // 清空之前的消息和状态，开始新任务
      useAppStore.getState().clearMessages();
      useAppStore.getState().setSlides([]);
      useAppStore.getState().setOutline(null);

      onStartProject({
        mode: selectedMode,
        input: inputValue,
        prompt: inputValue,
        template: selectedTemplate,
        files: uploadedFiles,
        skill: selectedSkill,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 border-b border-white/20 bg-white/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              知识架构师
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onGoToSkills}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
            >
              <Store className="w-4 h-4" />
              <span>技能广场</span>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              我的项目
            </button>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-glow transition-all">
              升级专业版
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 pt-28 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            将经验转化为资产
          </h1>
          <p className="text-xl text-gray-600">
            AI 驱动的培训内容生成平台，让知识传承更简单
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center space-x-4 mb-8 animate-slide-up">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                ${selectedMode === mode.id
                  ? 'bg-white shadow-soft scale-105 text-gray-900'
                  : 'bg-white/50 hover:bg-white/80 text-gray-600'
                }
              `}
            >
              <mode.icon className="w-5 h-5" />
              <span>{mode.name}</span>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-soft border border-white/20 p-6 mb-8 animate-slide-up">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {file.name.match(/\.(mp3|wav|m4a)$/i) ? (
                          <Mic className="w-4 h-4 text-blue-600" />
                        ) : file.name.match(/\.(pdf)$/i) ? (
                          <FileText className="w-4 h-4 text-red-600" />
                        ) : file.name.match(/\.(docx)$/i) ? (
                          <FileText className="w-4 h-4 text-blue-600" />
                        ) : file.name.match(/\.(pptx)$/i) ? (
                          <Presentation className="w-4 h-4 text-orange-600" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-600" />
                        )}
                      </div>

                      {/* File Name */}
                      <span className="text-sm text-gray-700 max-w-[150px] truncate">
                        {file.name}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          const newFiles = uploadedFiles.filter((_, i) => i !== index);
                          // Update the store
                          useAppStore.setState({ uploadedFiles: newFiles });
                        }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Skill Tag */}
              {selectedSkill && (
                <div className="mb-3">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{selectedSkill.name}</span>
                    <button
                      onClick={onClearSkill}
                      className="ml-2 hover:bg-white/50 rounded-full p-0.5 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`描述您的需求，例如：根据这段录音生成一份销冠复盘 PPT...`}
                className="w-full h-32 resize-none border-0 focus:outline-none text-gray-900 placeholder-gray-400"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".mp3,.wav,.m4a,.pdf,.docx,.pptx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">上传文件</span>
                    </div>
                  </label>
                  {selectedMode === 'ppt' && (
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Presentation className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {selectedTemplate ? pptTemplates.find(t => t.id === selectedTemplate)?.name : '选择主题'}
                      </span>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleStart}
                  disabled={!inputValue.trim() && uploadedFiles.length === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>开始生成</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mb-12 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">常用指令</h3>
          <div className="grid grid-cols-3 gap-4">
            {quickCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => handleQuickCommand(command.id)}
                className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-soft border border-white/20 hover:shadow-lg hover:scale-105 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <command.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {command.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">我的项目</h3>
          <div className="grid grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white/80 backdrop-blur-xl rounded-xl shadow-soft border border-white/20 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group overflow-hidden"
              >
                <div className="h-32 relative overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">{project.name}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{project.type}</span>
                    <span>{project.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Template Selection Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">选择 PPT 主题</h2>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {pptTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setIsTemplateModalOpen(false);
                    }}
                    className={`
                      relative group rounded-xl overflow-hidden transition-all
                      ${selectedTemplate === template.id
                        ? 'ring-4 ring-blue-500 scale-105'
                        : 'hover:scale-105 hover:shadow-xl'
                      }
                    `}
                  >
                    {/* Template Preview Image */}
                    <div className="aspect-[16/9] relative bg-gray-100">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Template Name Below Image */}
                    <div className="bg-white px-3 py-2 text-center">
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                    </div>

                    {/* Selected Indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedTemplate ? `已选择：${pptTemplates.find(t => t.id === selectedTemplate)?.name}` : '请选择一个主题'}
              </p>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-glow transition-all"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
