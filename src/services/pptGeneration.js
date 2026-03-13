// PPT 生成服务

// 使用 OpenAI 生成 PPT 大纲和内容
export const generatePPTWithOpenAI = async (content, config, apiKey) => {
  try {
    const prompt = `
请根据以下内容生成一份专业的演示文稿大纲：

内容：
${content}

要求：
- 场景：${config.scene}
- 页数：${config.pages} 页
- 语言：${config.language}

请以 JSON 格式返回，包含每一页的标题和内容要点。格式如下：
[
  {
    "title": "页面标题",
    "content": "页面内容要点",
    "layout": "title-slide" | "content" | "two-column" | "image-text"
  }
]
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的演示文稿设计师，擅长将内容转化为结构清晰、逻辑严谨的演示文稿。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      slides: result.slides || result,
    };
  } catch (error) {
    console.error('PPT 生成错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 模拟 PPT 生成（用于演示）
export const generatePPTMock = async (content, config) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 根据内容类型生成不同的大纲
  const mockSlides = [
    {
      id: 1,
      title: '封面页',
      content: content.summary || '知识架构师 - 将经验转化为资产',
      layout: 'title-slide',
    },
    {
      id: 2,
      title: '目录',
      content: '本次演示的主要内容概览',
      layout: 'content',
    },
  ];

  // 如果有关键信息点，添加到幻灯片中
  if (content.keyPoints && content.keyPoints.length > 0) {
    content.keyPoints.forEach((point, index) => {
      mockSlides.push({
        id: mockSlides.length + 1,
        title: `关键点 ${index + 1}`,
        content: point,
        layout: 'content',
      });
    });
  }

  // 如果有大纲，使用大纲生成幻灯片
  if (content.outline && content.outline.length > 0) {
    content.outline.forEach((item) => {
      mockSlides.push({
        id: mockSlides.length + 1,
        title: item.title,
        content: item.content,
        layout: 'content',
      });
    });
  }

  // 如果有话术，添加话术页面
  if (content.scripts && content.scripts.length > 0) {
    mockSlides.push({
      id: mockSlides.length + 1,
      title: '金牌话术',
      content: content.scripts.map(s => `${s.scene}: ${s.script}`).join('\n\n'),
      layout: 'two-column',
    });
  }

  // 添加总结页
  mockSlides.push({
    id: mockSlides.length + 1,
    title: '总结',
    content: '感谢观看！',
    layout: 'title-slide',
  });

  // 根据配置的页数调整
  const targetPages = config.pages || 10;
  if (mockSlides.length < targetPages) {
    // 如果页数不够，添加更多内容页
    const additionalPages = targetPages - mockSlides.length;
    for (let i = 0; i < additionalPages; i++) {
      mockSlides.splice(mockSlides.length - 1, 0, {
        id: mockSlides.length,
        title: `内容页 ${i + 1}`,
        content: '详细内容展开...',
        layout: 'content',
      });
    }
  } else if (mockSlides.length > targetPages) {
    // 如果页数太多，保留前面的和最后一页
    mockSlides.splice(targetPages - 1, mockSlides.length - targetPages);
  }

  return {
    success: true,
    slides: mockSlides,
  };
};

// 主 PPT 生成函数
export const generatePPT = async (analysisResult, config, apiKey = null) => {
  const content = analysisResult.content || analysisResult;

  // 如果提供了 API Key，使用真实 API
  if (apiKey) {
    // 将内容转换为文本
    let contentText = '';
    if (typeof content === 'string') {
      contentText = content;
    } else {
      contentText = JSON.stringify(content, null, 2);
    }

    return await generatePPTWithOpenAI(contentText, config, apiKey);
  }

  // 否则使用模拟数据
  return await generatePPTMock(content, config);
};

// 导出 PPT 为 PPTX 文件（需要后端支持或使用第三方库）
export const exportToPPTX = async (slides, template) => {
  // 这里可以集成 pptxgenjs 或其他库
  // 或者调用后端 API 生成 PPTX 文件
  console.log('导出 PPT:', slides, template);

  // 模拟导出
  return {
    success: true,
    message: 'PPT 导出功能开发中...',
  };
};

export default {
  generatePPT,
  generatePPTWithOpenAI,
  generatePPTMock,
  exportToPPTX,
};
