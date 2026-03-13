import pptxgen from 'pptxgenjs';

// PPT 模板配置
const TEMPLATES = {
  1: { // 商务简约
    background: { color: 'F5F5F5' },
    titleColor: '2C3E50',
    textColor: '34495E',
    accentColor: '3498DB',
  },
  2: { // 科技未来
    background: { color: '1A1A2E' },
    titleColor: '0F4C75',
    textColor: 'FFFFFF',
    accentColor: '00D9FF',
  },
  3: { // 创意活力
    background: { color: 'FFF5E6' },
    titleColor: 'FF6B35',
    textColor: '2C3E50',
    accentColor: 'FF006E',
  },
  4: { // 专业报告
    background: { color: 'FFFFFF' },
    titleColor: '4A148C',
    textColor: '212121',
    accentColor: '7B1FA2',
  },
  5: { // 教育培训
    background: { color: 'E8F5E9' },
    titleColor: '2E7D32',
    textColor: '1B5E20',
    accentColor: '66BB6A',
  },
  6: { // 营销推广
    background: { color: 'FFEBEE' },
    titleColor: 'C62828',
    textColor: '424242',
    accentColor: 'EF5350',
  },
  7: { // 极简风格
    background: { color: 'FFFFFF' },
    titleColor: '000000',
    textColor: '424242',
    accentColor: '9E9E9E',
  },
  8: { // 渐变时尚
    background: { color: 'F3E5F5' },
    titleColor: '6A1B9A',
    textColor: '4A148C',
    accentColor: 'BA68C8',
  },
  9: { // 深色主题
    background: { color: '212121' },
    titleColor: 'FFFFFF',
    textColor: 'E0E0E0',
    accentColor: '64B5F6',
  },
  10: { // 清新自然
    background: { color: 'F1F8E9' },
    titleColor: '558B2F',
    textColor: '33691E',
    accentColor: '8BC34A',
  },
};

// 创建封面页
const createTitleSlide = (pptx, slide, template) => {
  const slideObj = pptx.addSlide();

  // 背景
  slideObj.background = template.background;

  // 标题
  slideObj.addText(slide.title, {
    x: 0.5,
    y: '40%',
    w: '90%',
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: template.titleColor,
    align: 'center',
    valign: 'middle',
  });

  // 副标题/内容
  if (slide.content) {
    slideObj.addText(slide.content, {
      x: 0.5,
      y: '55%',
      w: '90%',
      h: 0.8,
      fontSize: 20,
      color: template.textColor,
      align: 'center',
      valign: 'middle',
    });
  }

  // 装饰线
  slideObj.addShape(pptx.ShapeType.rect, {
    x: '35%',
    y: '50%',
    w: '30%',
    h: 0.05,
    fill: { color: template.accentColor },
  });

  return slideObj;
};

// 创建内容页
const createContentSlide = (pptx, slide, template) => {
  const slideObj = pptx.addSlide();

  // 背景
  slideObj.background = template.background;

  // 标题
  slideObj.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: template.titleColor,
  });

  // 装饰线
  slideObj.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.4,
    w: 1.5,
    h: 0.05,
    fill: { color: template.accentColor },
  });

  // 内容
  const contentLines = slide.content.split('\n').filter(line => line.trim());

  if (contentLines.length <= 5) {
    // 如果内容较少，使用大字体
    slideObj.addText(slide.content, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 3.5,
      fontSize: 20,
      color: template.textColor,
      valign: 'top',
    });
  } else {
    // 如果内容较多，使用项目符号列表
    const bulletPoints = contentLines.map(line => ({
      text: line,
      options: { bullet: true, fontSize: 18, color: template.textColor },
    }));

    slideObj.addText(bulletPoints, {
      x: 0.5,
      y: 2,
      w: '90%',
      h: 3.5,
    });
  }

  return slideObj;
};

// 创建两栏布局页
const createTwoColumnSlide = (pptx, slide, template) => {
  const slideObj = pptx.addSlide();

  // 背景
  slideObj.background = template.background;

  // 标题
  slideObj.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: '90%',
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: template.titleColor,
  });

  // 装饰线
  slideObj.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.4,
    w: 1.5,
    h: 0.05,
    fill: { color: template.accentColor },
  });

  // 分割内容为两栏
  const contentLines = slide.content.split('\n').filter(line => line.trim());
  const midPoint = Math.ceil(contentLines.length / 2);
  const leftContent = contentLines.slice(0, midPoint).join('\n');
  const rightContent = contentLines.slice(midPoint).join('\n');

  // 左栏
  slideObj.addText(leftContent, {
    x: 0.5,
    y: 2,
    w: '42%',
    h: 3.5,
    fontSize: 16,
    color: template.textColor,
    valign: 'top',
  });

  // 右栏
  slideObj.addText(rightContent, {
    x: '52%',
    y: 2,
    w: '42%',
    h: 3.5,
    fontSize: 16,
    color: template.textColor,
    valign: 'top',
  });

  return slideObj;
};

// 主导出函数
export const exportToPPTX = async (slides, templateId = 1, config = {}) => {
  try {
    const pptx = new pptxgen();

    // 设置 PPT 属性
    pptx.author = '知识架构师';
    pptx.company = 'Knowledge Architect';
    pptx.title = config.title || '演示文稿';
    pptx.subject = config.subject || '由知识架构师生成';

    // 设置幻灯片尺寸（16:9）
    pptx.layout = 'LAYOUT_16x9';

    // 获取模板
    const template = TEMPLATES[templateId] || TEMPLATES[1];

    // 生成每一页
    slides.forEach((slide, index) => {
      const layout = slide.layout || 'content';

      if (layout === 'title-slide' || index === 0) {
        createTitleSlide(pptx, slide, template);
      } else if (layout === 'two-column') {
        createTwoColumnSlide(pptx, slide, template);
      } else {
        createContentSlide(pptx, slide, template);
      }
    });

    // 生成文件名
    const fileName = `${config.title || '演示文稿'}_${new Date().getTime()}.pptx`;

    // 导出文件
    await pptx.writeFile({ fileName });

    return {
      success: true,
      fileName,
      message: 'PPT 已成功生成并下载！',
    };
  } catch (error) {
    console.error('PPT 导出错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// 预览 PPT（生成 base64）
export const previewPPTX = async (slides, templateId = 1) => {
  try {
    const pptx = new pptxgen();
    const template = TEMPLATES[templateId] || TEMPLATES[1];

    // 只生成前 3 页作为预览
    const previewSlides = slides.slice(0, 3);

    previewSlides.forEach((slide, index) => {
      const layout = slide.layout || 'content';

      if (layout === 'title-slide' || index === 0) {
        createTitleSlide(pptx, slide, template);
      } else {
        createContentSlide(pptx, slide, template);
      }
    });

    // 生成 base64
    const base64 = await pptx.write({ outputType: 'base64' });

    return {
      success: true,
      preview: base64,
    };
  } catch (error) {
    console.error('PPT 预览错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  exportToPPTX,
  previewPPTX,
};
