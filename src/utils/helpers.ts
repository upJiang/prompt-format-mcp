/**
 * 📝 日志记录器工具
 * 提供统一的日志记录接口，支持不同级别的日志输出
 * 在MCP环境中，日志会输出到stderr，不会干扰stdio通信
 */
export const Logger = {
  /**
   * 📋 普通信息日志
   * 用于记录程序的正常运行信息
   * @param args 要记录的信息
   */
  log: (...args: any[]) => console.log('[INFO]', ...args),

  /**
   * 🚨 错误日志
   * 用于记录错误信息，会输出到stderr
   * @param args 要记录的错误信息
   */
  error: (...args: any[]) => console.error('[ERROR]', ...args),

  /**
   * ⚠️ 警告日志
   * 用于记录警告信息
   * @param args 要记录的警告信息
   */
  warn: (...args: any[]) => console.warn('[WARN]', ...args),

  /**
   * 🔍 调试日志
   * 只在开发环境中输出，用于调试信息
   * @param args 要记录的调试信息
   */
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  }
};

/**
 * ⏰ 延迟函数
 * 创建一个指定时间后解析的Promise，用于实现延迟执行
 * @param ms 延迟的毫秒数
 * @returns Promise<void> 在指定时间后解析的Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔄 重试函数
 * 提供自动重试机制，在函数执行失败时自动重试
 * 这是提高API调用可靠性的重要工具
 * 
 * @param fn 要执行的异步函数
 * @param maxAttempts 最大重试次数（默认3次）
 * @param delayMs 每次重试间的基础延迟时间（默认1000ms）
 * @returns Promise<T> 函数执行的结果
 * @throws Error 如果所有重试都失败，抛出最后一次的错误
 */
export async function retry<T>(
  fn: () => Promise<T>,      // 要重试的函数
  maxAttempts: number = 3,   // 最大重试次数
  delayMs: number = 1000     // 基础延迟时间
): Promise<T> {
  let lastError: Error;      // 保存最后一次的错误

  // 🔁 重试循环
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 🎯 尝试执行函数
      return await fn();
    } catch (error) {
      // 📝 保存错误信息
      lastError = error as Error;
      
      // 📊 记录重试信息
      Logger.warn(`尝试 ${attempt}/${maxAttempts} 失败:`, error);

      // 🕐 如果不是最后一次尝试，等待后重试
      if (attempt < maxAttempts) {
        // 使用递增延迟：第一次延迟delayMs，第二次延迟2*delayMs，以此类推
        await delay(delayMs * attempt);
      }
    }
  }

  // 🚨 所有重试都失败了，抛出最后一次的错误
  throw lastError!;
} 