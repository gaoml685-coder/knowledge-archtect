import { useState } from 'react';
import { X, Key, Info } from 'lucide-react';
import useSettingsStore from '../store/useSettingsStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const { openaiApiKey, groqApiKey, elevenlabsApiKey, setOpenAIKey, setGroqKey, setElevenLabsKey, useRealAPI, setUseRealAPI } = useSettingsStore();
  const [tempOpenAIKey, setTempOpenAIKey] = useState(openaiApiKey);
  const [tempGroqKey, setTempGroqKey] = useState(groqApiKey);
  const [tempElevenLabsKey, setTempElevenLabsKey] = useState(elevenlabsApiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    setOpenAIKey(tempOpenAIKey);
    setGroqKey(tempGroqKey);
    setElevenLabsKey(tempElevenLabsKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">API 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">关于 API 配置</p>
              <p>
                默认使用模拟数据进行演示。如需使用真实的文档分析功能，请配置 OpenAI API Key。
                您的 API Key 仅保存在本地浏览器中，不会上传到服务器。
              </p>
            </div>
          </div>

          {/* Use Real API Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">启用真实 API</label>
              <p className="text-xs text-gray-500 mt-1">关闭后将使用模拟数据进行演示</p>
            </div>
            <button
              onClick={() => setUseRealAPI(!useRealAPI)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useRealAPI ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useRealAPI ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={tempOpenAIKey}
              onChange={(e) => setTempOpenAIKey(e.target.value)}
              placeholder="sk-..."
              disabled={!useRealAPI}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              用于文档分析和内容生成。获取地址：
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Groq API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Groq API Key（免费）
            </label>
            <input
              type="password"
              value={tempGroqKey}
              onChange={(e) => setTempGroqKey(e.target.value)}
              placeholder="gsk_..."
              disabled={!useRealAPI}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              用于音频转文字（Whisper）。免费获取：
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Groq Console
              </a>
            </p>
          </div>

          {/* API Features */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">支持的功能</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>PDF 文档解析与内容提取</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Word 文档分析</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>音频转文字（.mp3, .wav, .m4a）</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>智能内容结构化</span>
              </div>
            </div>
          </div>

          {/* Alternative APIs */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">其他可用的 API</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                • <strong>PDF.ai</strong>：专门的 PDF 解析服务
                <a
                  href="https://pdf.ai/parse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  了解更多
                </a>
              </p>
              <p>
                • <strong>火山引擎豆包</strong>：国内可用的大模型服务
                <a
                  href="https://www.volcengine.com/docs/82379/1273558"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  了解更多
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-glow transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
