// API 配置
const API_CONFIG = {
  // OpenAI API (支持文档、图片分析)
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o', // 支持视觉和文档理解
  },

  // Groq Whisper API (免费语音转文字)
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
    model: 'whisper-large-v3',
  },

  // PDF.ai API (专门用于 PDF 解析)
  pdfai: {
    endpoint: 'https://pdf.ai/api/v2/parse',
  },

  // 火山引擎豆包 API (国内可用)
  doubao: {
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  }
};

// 文件类型检测
const getFileType = (file) => {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a')) {
    return 'audio';
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
    return 'document';
  }
  if (type.includes('presentation') || name.endsWith('.pptx') || name.endsWith('.ppt')) {
    return 'presentation';
  }
  return 'unknown';
};

// 将文件转换为 Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// 使用 OpenAI API 分析文档
export const analyzeWithOpenAI = async (file, apiKey) => {
  try {
    const fileType = getFileType(file);
    const base64Data = await fileToBase64(file);

    let prompt = '';
    if (fileType === 'audio') {
      prompt = '请转录这段音频内容，并提取其中的关键信息、重要观点和可用于制作培训材料的内容。';
    } else if (fileType === 'pdf' || fileType === 'document') {
      prompt = '请分析这份文档，提取其中的核心内容、关键知识点、案例和可用于制作演示文稿的素材。请以结构化的方式输出。';
    } else if (fileType === 'presentation') {
      prompt = '请分析这份演示文稿，提取其中的主要内容结构、关键信息点和设计思路。';
    }

    const response = await fetch(API_CONFIG.openai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: base64Data,
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices[0].message.content,
      fileType,
    };
  } catch (error) {
    console.error('OpenAI API 错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 使用 Groq Whisper API 进行语音转文字
export const transcribeWithGroq = async (file, apiKey) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', API_CONFIG.groq.model);
    formData.append('language', 'zh'); // 中文
    formData.append('response_format', 'json');

    const response = await fetch(API_CONFIG.groq.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Groq API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      transcription: data.text,
    };
  } catch (error) {
    console.error('Groq Whisper API 错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 分析音频文件（转文字 + AI 分析）
export const analyzeAudio = async (file, groqApiKey, openaiApiKey, userCommand = '总结提炼') => {
  try {
    // 第一步：使用 Groq Whisper 转文字
    const transcriptionResult = await transcribeWithGroq(file, groqApiKey);

    if (!transcriptionResult.success) {
      throw new Error(transcriptionResult.error);
    }

    const transcription = transcriptionResult.transcription;

    // 第二步：根据用户指令使用 OpenAI 分析文本
    let prompt = '';
    if (userCommand.includes('总结') || userCommand.includes('提炼')) {
      prompt = `请分析以下录音转录文本，提取关键信息、核心观点和重要内容：\n\n${transcription}`;
    } else if (userCommand.includes('话术') || userCommand.includes('脚本')) {
      prompt = `请从以下录音转录文本中提取金牌话术和销售脚本，包括场景、话术内容和逻辑：\n\n${transcription}`;
    } else if (userCommand.includes('大纲') || userCommand.includes('结构')) {
      prompt = `请为以下录音转录文本生成演示文稿大纲，包括标题和内容要点：\n\n${transcription}`;
    } else {
      prompt = `${userCommand}\n\n录音转录文本：\n${transcription}`;
    }

    const response = await fetch(API_CONFIG.openai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 使用更经济的模型
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      transcription,
      analysis: data.choices[0].message.content,
      fileType: 'audio',
      fileName: file.name,
    };
  } catch (error) {
    console.error('音频分析错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 使用本地模拟分析（用于演示）
export const analyzeWithMock = async (file) => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const fileType = getFileType(file);

  const mockResults = {
    audio: {
      keyPoints: [
        '销售技巧：建立信任关系是成交的关键',
        '客户痛点：价格敏感度高，需要展示性价比',
        '成功案例：通过对比演示提升转化率 40%',
        '话术要点：先倾听客户需求，再提供解决方案',
      ],
      scripts: [
        { scene: '初次接触', script: '您好，我注意到您对我们的产品很感兴趣...', logic: '建立亲和力' },
        { scene: '需求挖掘', script: '能否分享一下您目前遇到的主要挑战？', logic: '了解痛点' },
        { scene: '方案呈现', script: '基于您的需求，我们的方案可以...', logic: '针对性解决' },
      ],
      summary: '这是一段关于销售培训的录音，主讲人分享了多个实战案例和话术技巧。',
    },
    pdf: {
      keyPoints: [
        '市场分析：目标客户群体为 25-40 岁职场人士',
        '产品优势：AI 驱动，效率提升 3 倍',
        '竞争策略：差异化定位，聚焦垂直领域',
        '增长目标：Q1 用户增长 50%',
      ],
      outline: [
        { title: '市场概况', content: '行业趋势、竞争格局、机会分析' },
        { title: '产品介绍', content: '核心功能、技术优势、用户价值' },
        { title: '营销策略', content: '渠道布局、内容营销、品牌建设' },
        { title: '财务预测', content: '收入模型、成本结构、盈利预期' },
      ],
      summary: '这是一份商业计划书，详细阐述了产品定位、市场策略和增长计划。',
    },
    document: {
      keyPoints: [
        '培训目标：提升团队协作效率',
        '核心方法：敏捷开发流程',
        '实施步骤：分阶段推进，持续迭代',
        '预期成果：项目交付周期缩短 30%',
      ],
      outline: [
        { title: '背景介绍', content: '当前挑战、改进必要性' },
        { title: '方法论', content: '敏捷原则、Scrum 框架' },
        { title: '实践案例', content: '成功经验、常见问题' },
        { title: '行动计划', content: '时间表、责任分工' },
      ],
      summary: '这是一份关于敏捷开发培训的文档，包含理论和实践指导。',
    },
  };

  const result = mockResults[fileType] || mockResults.document;

  return {
    success: true,
    content: result,
    fileType,
    fileName: file.name,
  };
};

// 主分析函数
export const analyzeFile = async (file, apiKeys = {}, userCommand = '总结提炼') => {
  const fileType = getFileType(file);

  // 如果是音频文件且提供了 Groq API Key
  if (fileType === 'audio' && apiKeys.groq && apiKeys.openai) {
    return await analyzeAudio(file, apiKeys.groq, apiKeys.openai, userCommand);
  }

  // 如果提供了 OpenAI API Key，使用真实 API
  if (apiKeys.openai) {
    return await analyzeWithOpenAI(file, apiKeys.openai);
  }

  // 否则使用模拟数据（用于演示）
  return await analyzeWithMock(file);
};

export default {
  analyzeFile,
  analyzeWithOpenAI,
  analyzeWithMock,
  transcribeWithGroq,
  analyzeAudio,
};
