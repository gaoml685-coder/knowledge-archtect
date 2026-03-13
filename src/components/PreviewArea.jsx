import { FileQuestion, FileText, Presentation } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const PreviewArea = () => {
  const { viewState, slides } = useAppStore();

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <FileQuestion className="w-16 h-16 mb-4" />
      <p className="text-lg font-medium">预览区域</p>
      <p className="text-sm mt-2">上传素材并开始对话后，内容将在此处显示</p>
    </div>
  );

  const renderOutlineState = () => (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">演示文稿大纲</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">大纲内容将在此处显示...</p>
        </div>
      </div>
    </div>
  );

  const renderRenderState = () => (
    <div className="h-full overflow-y-auto p-8 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Presentation className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">演示文稿预览</h2>
          </div>
          <div className="text-sm text-gray-500">
            共 {slides.length} 页
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-400">暂无幻灯片内容</p>
          </div>
        ) : (
          <div className="space-y-6">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    幻灯片 {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {slide.title || '无标题'}
                </h3>
                <div className="text-gray-700 space-y-2">
                  {slide.content && (
                    <div className="prose max-w-none">
                      {slide.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-white">
      {viewState === 'empty' && renderEmptyState()}
      {viewState === 'outline' && renderOutlineState()}
      {viewState === 'render' && renderRenderState()}
    </div>
  );
};

export default PreviewArea;
