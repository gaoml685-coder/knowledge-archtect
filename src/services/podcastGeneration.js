// 播客生成服务

// 使用 ElevenLabs API 生成播客
export const generatePodcastWithElevenLabs = async (script, apiKey, config = {}) => {
  try {
    // 第一步：将脚本转换为对话格式
    const dialogues = parseScriptToDialogues(script);

    // 第二步：为每个对话生成音频
    const audioSegments = [];

    for (const dialogue of dialogues) {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + dialogue.voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: dialogue.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API 请求失败: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      audioSegments.push({
        speaker: dialogue.speaker,
        audio: audioBlob,
      });
    }

    return {
      success: true,
      audioSegments,
      totalDuration: audioSegments.length * 5, // 估算时长
    };
  } catch (error) {
    console.error('ElevenLabs 播客生成错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 将脚本解析为对话格式
const parseScriptToDialogues = (script) => {
  // 默认使用两个主持人
  const host1VoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam
  const host2VoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah

  const dialogues = [];
  const lines = script.split('\n').filter(line => line.trim());

  lines.forEach((line, index) => {
    // 交替使用两个主持人
    const voiceId = index % 2 === 0 ? host1VoiceId : host2VoiceId;
    const speaker = index % 2 === 0 ? '主持人 A' : '主持人 B';

    dialogues.push({
      speaker,
      voiceId,
      text: line.trim(),
    });
  });

  return dialogues;
};

// 使用 OpenAI 生成播客脚本
export const generatePodcastScript = async (content, style, apiKey) => {
  try {
    let prompt = '';

    if (style === 'story') {
      prompt = `
请将以下内容转换为一个引人入胜的故事版播客脚本。

要求：
1. 使用两个主持人（主持人 A 和主持人 B）进行对话
2. 采用故事叙述的方式，生动有趣
3. 包含开场白、主要内容讨论、案例分享、总结
4. 每个主持人的对话要自然流畅，有互动感
5. 总时长控制在 5-10 分钟

内容：
${content}

请以以下格式输出脚本：
主持人 A: [对话内容]
主持人 B: [对话内容]
...
`;
    } else if (style === 'interview') {
      prompt = `
请将以下内容转换为访谈式播客脚本。

要求：
1. 主持人提问，嘉宾回答
2. 问题要有深度，回答要详细
3. 包含开场介绍、核心问题讨论、经验分享、结束语
4. 对话要专业但不失亲和力

内容：
${content}

请以以下格式输出脚本：
主持人: [问题]
嘉宾: [回答]
...
`;
    } else {
      // 默认：对话式
      prompt = `
请将以下内容转换为对话式播客脚本。

要求：
1. 两个主持人轻松对话
2. 讨论要有逻辑，层层递进
3. 包含开场、主要内容、案例、总结
4. 语言要口语化，易于理解

内容：
${content}

请以以下格式输出脚本：
主持人 A: [对话内容]
主持人 B: [对话内容]
...
`;
    }

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
            content: '你是一个专业的播客脚本编剧，擅长将内容转化为生动有趣的对话。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    const script = data.choices[0].message.content;

    return {
      success: true,
      script,
    };
  } catch (error) {
    console.error('播客脚本生成错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 模拟播客生成（用于演示）
export const generatePodcastMock = async (content, style) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockScripts = {
    story: `主持人 A: 大家好，欢迎来到今天的节目。今天我们要分享一个非常有趣的故事。

主持人 B: 是的，这个故事关于${content.summary || '知识管理和经验传承'}。让我先给大家介绍一下背景。

主持人 A: 听起来很有意思！那具体是怎么回事呢？

主持人 B: 事情是这样的...${content.keyPoints?.[0] || '通过系统化的方法，我们可以将隐性知识显性化'}。

主持人 A: 哇，这确实是个很好的方法。那后来呢？

主持人 B: 后来的发展更加精彩。${content.keyPoints?.[1] || '团队通过持续实践，效率提升了30%'}。

主持人 A: 太棒了！这个案例给我们带来了很多启发。

主持人 B: 没错，关键在于${content.keyPoints?.[2] || '建立标准化的流程和可复用的模板'}。

主持人 A: 好的，今天的分享就到这里。感谢大家的收听！

主持人 B: 我们下期再见！`,

    interview: `主持人: 欢迎来到今天的访谈节目。今天我们邀请到了一位在${content.summary || '知识管理领域'}有丰富经验的专家。

嘉宾: 大家好，很高兴来到这里。

主持人: 首先想请教您，${content.keyPoints?.[0] || '如何有效地进行知识管理'}？

嘉宾: 这是个很好的问题。我认为关键在于建立系统化的方法...

主持人: 能否分享一个具体的案例？

嘉宾: 当然。我们曾经遇到过这样一个情况...${content.keyPoints?.[1] || '通过标准化流程，大大提升了效率'}。

主持人: 听起来效果很显著。那在实施过程中有什么挑战吗？

嘉宾: 确实有一些挑战。主要是...${content.keyPoints?.[2] || '需要改变团队的工作习惯'}。

主持人: 非常感谢您的分享。今天的访谈就到这里。

嘉宾: 谢谢！`,

    dialogue: `主持人 A: 嗨，今天我们来聊聊${content.summary || '知识管理'}这个话题。

主持人 B: 好啊，这个话题很实用。你觉得最重要的是什么？

主持人 A: 我认为${content.keyPoints?.[0] || '系统化是关键'}。你怎么看？

主持人 B: 我同意。而且${content.keyPoints?.[1] || '还需要持续优化'}。

主持人 A: 对，就像我们之前讨论的那个案例。

主持人 B: 是的，${content.keyPoints?.[2] || '实践证明这个方法很有效'}。

主持人 A: 总结一下，今天我们分享了一些实用的方法。

主持人 B: 希望对大家有帮助。我们下次再聊！`,
  };

  const script = mockScripts[style] || mockScripts.dialogue;

  return {
    success: true,
    script,
    audioUrl: null, // 模拟模式不生成真实音频
  };
};

// 主播客生成函数
export const generatePodcast = async (analysisResult, style = 'story', apiKeys = {}) => {
  const content = analysisResult.content || analysisResult;

  // 第一步：生成脚本
  let scriptResult;
  if (apiKeys.openai) {
    // 将内容转换为文本
    let contentText = '';
    if (typeof content === 'string') {
      contentText = content;
    } else if (content.transcription) {
      contentText = content.transcription;
    } else {
      contentText = JSON.stringify(content, null, 2);
    }

    scriptResult = await generatePodcastScript(contentText, style, apiKeys.openai);
  } else {
    scriptResult = await generatePodcastMock(content, style);
  }

  if (!scriptResult.success) {
    return scriptResult;
  }

  // 第二步：生成音频（如果有 ElevenLabs API Key）
  if (apiKeys.elevenlabs) {
    const audioResult = await generatePodcastWithElevenLabs(
      scriptResult.script,
      apiKeys.elevenlabs
    );

    return {
      success: audioResult.success,
      script: scriptResult.script,
      audioSegments: audioResult.audioSegments,
      error: audioResult.error,
    };
  }

  // 只返回脚本
  return {
    success: true,
    script: scriptResult.script,
    audioUrl: null,
  };
};

export default {
  generatePodcast,
  generatePodcastScript,
  generatePodcastWithElevenLabs,
  generatePodcastMock,
};
