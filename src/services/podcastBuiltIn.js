// 浏览器原生播客生成服务（无需 API Key）

// 使用浏览器 Web Speech API 生成语音
export const generatePodcastWithBrowserTTS = async (script) => {
  return new Promise((resolve, reject) => {
    try {
      // 检查浏览器是否支持 Speech Synthesis
      if (!('speechSynthesis' in window)) {
        reject(new Error('您的浏览器不支持语音合成功能'));
        return;
      }

      const dialogues = parseScriptToDialogues(script);
      const audioSegments = [];

      // 获取可用的语音
      const voices = window.speechSynthesis.getVoices();
      const chineseVoices = voices.filter(voice =>
        voice.lang.includes('zh') || voice.lang.includes('CN')
      );

      // 选择两个不同的声音作为主持人
      const voice1 = chineseVoices[0] || voices[0];
      const voice2 = chineseVoices[1] || voices[1] || voices[0];

      let currentIndex = 0;

      const speakNext = () => {
        if (currentIndex >= dialogues.length) {
          resolve({
            success: true,
            audioSegments,
            script,
          });
          return;
        }

        const dialogue = dialogues[currentIndex];
        const utterance = new SpeechSynthesisUtterance(dialogue.text);

        // 交替使用两个声音
        utterance.voice = currentIndex % 2 === 0 ? voice1 : voice2;
        utterance.rate = 1.0; // 语速
        utterance.pitch = currentIndex % 2 === 0 ? 1.0 : 1.1; // 音调
        utterance.volume = 1.0; // 音量

        utterance.onend = () => {
          audioSegments.push({
            speaker: dialogue.speaker,
            text: dialogue.text,
          });
          currentIndex++;
          speakNext();
        };

        utterance.onerror = (error) => {
          reject(new Error(`语音合成失败: ${error.error}`));
        };

        window.speechSynthesis.speak(utterance);
      };

      // 开始生成
      speakNext();

    } catch (error) {
      reject(error);
    }
  });
};

// 解析脚本为对话格式
const parseScriptToDialogues = (script) => {
  const dialogues = [];
  const lines = script.split('\n').filter(line => line.trim());

  lines.forEach((line) => {
    // 尝试解析 "主持人 A: 内容" 格式
    const match = line.match(/^(.+?)[:：]\s*(.+)$/);

    if (match) {
      dialogues.push({
        speaker: match[1].trim(),
        text: match[2].trim(),
      });
    } else if (line.trim()) {
      // 如果没有匹配到格式，直接使用整行
      dialogues.push({
        speaker: '旁白',
        text: line.trim(),
      });
    }
  });

  return dialogues;
};

// 使用 OpenAI 生成播客脚本（如果有 API Key）
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

请以以下格式输出脚本（每行一个对话）：
主持人 A: [对话内容]
主持人 B: [对话内容]
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

请以以下格式输出脚本（每行一个对话）：
主持人: [问题]
嘉宾: [回答]
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

请以以下格式输出脚本（每行一个对话）：
主持人 A: [对话内容]
主持人 B: [对话内容]
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

// 生成模拟播客脚本
export const generateMockPodcastScript = (content, style) => {
  const summary = content.summary || '知识管理和经验传承';
  const keyPoints = content.keyPoints || ['系统化方法', '持续优化', '实践验证'];
  const transcription = content.transcription || '';

  // 从转录文本或内容中提取关键信息
  const mainContent = transcription || JSON.stringify(content);

  if (style === 'story') {
    return `主持人 A: 大家好，欢迎来到今天的节目。今天我们要分享一个非常有趣的故事。
主持人 B: 是的，这个故事关于${summary}。让我先给大家介绍一下背景。
主持人 A: 听起来很有意思！那具体是怎么回事呢？
主持人 B: 事情是这样的...${keyPoints[0]}。这个发现让我们意识到，传统的方法可能需要改进。
主持人 A: 哇，这确实是个很好的观察。那后来呢？
主持人 B: 后来的发展更加精彩。${keyPoints[1]}。团队通过不断实践，找到了最佳方案。
主持人 A: 太棒了！这个案例给我们带来了很多启发。
主持人 B: 没错，关键在于${keyPoints[2]}。只有这样，才能真正实现价值。
主持人 A: 非常感谢今天的分享。这些经验对我们的听众一定很有帮助。
主持人 B: 是的，希望大家能从中获得启发，应用到自己的工作中。
主持人 A: 好的，今天的分享就到这里。感谢大家的收听！
主持人 B: 我们下期再见！`;
  } else if (style === 'interview') {
    return `主持人: 欢迎来到今天的访谈节目。今天我们邀请到了一位在${summary}领域有丰富经验的专家。
嘉宾: 大家好，很高兴来到这里。
主持人: 首先想请教您，${keyPoints[0]}的核心要点是什么？
嘉宾: 这是个很好的问题。我认为关键在于建立系统化的方法。从我的经验来看，很多团队在这方面都存在挑战。
主持人: 能否分享一个具体的案例？
嘉宾: 当然。我们曾经遇到过这样一个情况...${keyPoints[1]}。通过这个方法，我们大大提升了效率。
主持人: 听起来效果很显著。那在实施过程中有什么挑战吗？
嘉宾: 确实有一些挑战。主要是${keyPoints[2]}。但只要坚持下去，最终都能看到成效。
主持人: 对于我们的听众，您有什么建议吗？
嘉宾: 我建议大家从小处着手，不要一开始就追求完美。持续改进比一次性做对更重要。
主持人: 非常感谢您的分享。今天的访谈就到这里。
嘉宾: 谢谢！希望对大家有帮助。`;
  } else {
    return `主持人 A: 嗨，今天我们来聊聊${summary}这个话题。
主持人 B: 好啊，这个话题很实用。你觉得最重要的是什么？
主持人 A: 我认为${keyPoints[0]}是关键。你怎么看？
主持人 B: 我同意。而且${keyPoints[1]}也很重要。
主持人 A: 对，就像我们之前讨论的那个案例。
主持人 B: 是的，${keyPoints[2]}。实践证明这个方法很有效。
主持人 A: 总结一下，今天我们分享了一些实用的方法和经验。
主持人 B: 希望对大家有帮助。如果你有任何问题，欢迎留言讨论。
主持人 A: 好的，今天就到这里。
主持人 B: 我们下次再聊！`;
  }
};

// 主播客生成函数（内置，无需 API Key）
export const generatePodcastBuiltIn = async (analysisResult, style = 'story', apiKey = null) => {
  try {
    const content = analysisResult.content || analysisResult;

    // 第一步：生成脚本
    let script;
    if (apiKey) {
      // 如果有 API Key，使用 OpenAI 生成更好的脚本
      let contentText = '';
      if (typeof content === 'string') {
        contentText = content;
      } else if (content.transcription) {
        contentText = content.transcription;
      } else if (content.analysis) {
        contentText = content.analysis;
      } else {
        contentText = JSON.stringify(content, null, 2);
      }

      const scriptResult = await generatePodcastScript(contentText, style, apiKey);
      if (scriptResult.success) {
        script = scriptResult.script;
      } else {
        throw new Error(scriptResult.error);
      }
    } else {
      // 否则使用内置模板生成脚本
      script = generateMockPodcastScript(content, style);
    }

    return {
      success: true,
      script,
      method: 'builtin',
      message: '播客脚本已生成！点击"播放预览"可以使用浏览器语音朗读。',
    };
  } catch (error) {
    console.error('播客生成错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 播放播客（使用浏览器 TTS）
export const playPodcast = (script) => {
  return generatePodcastWithBrowserTTS(script);
};

// 停止播放
export const stopPodcast = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// 导出播客为音频文件（需要录制浏览器音频）
export const exportPodcastAudio = async (script) => {
  // 这个功能需要使用 MediaRecorder API 录制浏览器音频
  // 由于浏览器限制，这里提供一个简化版本
  return {
    success: false,
    message: '音频导出功能开发中。您可以使用系统录音工具录制播放的音频。',
  };
};

export default {
  generatePodcastBuiltIn,
  playPodcast,
  stopPodcast,
  exportPodcastAudio,
};
