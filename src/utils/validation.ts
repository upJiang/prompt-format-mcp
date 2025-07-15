import { FormatStyle } from '../types/index.js';

/**
 * 验证输入内容是否有效
 */
export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: '内容不能为空' };
  }

  if (content.trim().length === 0) {
    return { isValid: false, error: '内容不能为空白字符' };
  }

  if (content.length > 50000) {
    return { isValid: false, error: '内容长度不能超过50000个字符' };
  }

  return { isValid: true };
}

/**
 * 验证格式化风格是否有效
 */
export function validateFormatStyle(style: string): { isValid: boolean; error?: string } {
  const validStyles: FormatStyle[] = ['basic', 'professional', 'conversational', 'technical'];
  
  if (!validStyles.includes(style as FormatStyle)) {
    return { 
      isValid: false, 
      error: `无效的格式化风格。支持的风格: ${validStyles.join(', ')}` 
    };
  }

  return { isValid: true };
}

/**
 * 清理和预处理输入内容
 */
export function sanitizeContent(content: string): string {
  // 移除多余的空白字符
  return content
    .replace(/\r\n/g, '\n')  // 统一换行符
    .replace(/\t/g, '  ')    // 制表符转为空格
    .trim();                 // 移除首尾空白
}

/**
 * 检查内容是否可能已经格式化
 */
export function isAlreadyFormatted(content: string): boolean {
  const markdownIndicators = [
    /^#\s+/m,           // 标题
    /^##\s+/m,          // 二级标题
    /^```/m,            // 代码块
    /^\*\s+/m,          // 列表
    /^-\s+/m,           // 列表
    /^\d+\.\s+/m,       // 数字列表
    /^>\s+/m,           // 引用
    /\*\*.*\*\*/,       // 粗体
    /\*.*\*/,           // 斜体
  ];

  let matchCount = 0;
  for (const indicator of markdownIndicators) {
    if (indicator.test(content)) {
      matchCount++;
    }
  }

  // 如果匹配到3个或更多markdown格式，认为已经格式化
  return matchCount >= 3;
}

/**
 * 估算内容的复杂度
 */
export function estimateComplexity(content: string): 'simple' | 'medium' | 'complex' {
  const length = content.length;
  const lineCount = content.split('\n').length;
  const wordCount = content.split(/\s+/).length;

  if (length < 500 && lineCount < 10 && wordCount < 100) {
    return 'simple';
  } else if (length < 2000 && lineCount < 50 && wordCount < 400) {
    return 'medium';
  } else {
    return 'complex';
  }
} 