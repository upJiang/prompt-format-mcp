/**
 * 日志记录器
 */
export const Logger = {
  log: (...args: any[]) => console.log('[INFO]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  }
};

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      Logger.warn(`尝试 ${attempt}/${maxAttempts} 失败:`, error);

      if (attempt < maxAttempts) {
        await delay(delayMs * attempt); // 递增延迟
      }
    }
  }

  throw lastError!;
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 格式化文件大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 检查是否为有效的URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 计算文本的字符数和单词数
 */
export function getTextStats(text: string): {
  characters: number;
  words: number;
  lines: number;
  paragraphs: number;
} {
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text.split('\n').length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;

  return { characters, words, lines, paragraphs };
} 