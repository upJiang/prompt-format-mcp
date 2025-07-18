#!/usr/bin/env node
// 📍 Shebang行：告诉操作系统使用node解释器执行此脚本
// 这使得该文件可以作为可执行文件直接运行

// 🔧 导入核心模块
import { PromptFormatMcpServer } from "./server.js";  // 导入我们的MCP服务器类
import { config } from "dotenv";                       // 导入环境变量配置工具
import { resolve } from "path";                        // 导入路径解析工具
import { Logger } from "./utils/helpers.js";           // 导入日志工具

// 🌐 环境变量加载
// 尝试从.env文件加载环境变量（如果存在）
// 在MCP场景下，环境变量通常由客户端（如Cursor）通过配置传递
try {
  config({ path: resolve(process.cwd(), ".env") });    // 从当前工作目录加载.env文件
} catch (error) {
  // 静默忽略.env文件不存在的错误
  // 因为在MCP环境中，环境变量由客户端配置提供
}

// 🔒 环境变量验证
// 检查必需的API密钥是否存在
if (!process.env.SILICONFLOW_API_KEY) {
  // 如果API密钥不存在，输出详细的错误信息和解决方案
  console.error("错误: 请设置环境变量 SILICONFLOW_API_KEY");
  console.error("在MCP服务器配置中，请确保在env字段中设置了此变量");
  console.error("或者在 .env 文件中配置这个变量，例如：");
  console.error("SILICONFLOW_API_KEY=your_api_key_here");
  process.exit(1);  // 以错误状态退出程序
}

/**
 * 🚀 启动服务器函数
 * 这是程序的主入口点，负责创建和启动MCP服务器
 */
export async function startServer(): Promise<void> {
  try {
    // 创建MCP服务器实例
    const server = new PromptFormatMcpServer();
    
    // 输出启动日志
    Logger.log("启动 Prompt Format MCP 服务器...");
    
    // 启动stdio传输模式的服务器
    // stdio模式是MCP协议的标准传输方式，通过标准输入输出与客户端通信
    await server.startStdio();
  } catch (error) {
    // 如果启动失败，记录错误并退出
    Logger.error("服务器启动失败:", error);
    process.exit(1);
  }
}

// 🛡️ 全局异常处理
// 捕获未处理的异常，防止程序意外崩溃
process.on('uncaughtException', (error) => {
  Logger.error('未捕获的异常:', error);
  process.exit(1);  // 异常退出
});

// 🔄 Promise拒绝处理
// 捕获未处理的Promise拒绝，这通常表示异步操作中的错误
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);  // 异常退出
});

// 🛑 进程信号处理
// 处理SIGINT信号（Ctrl+C）
process.on('SIGINT', () => {
  Logger.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);  // 正常退出
});

// 🔚 终止信号处理
// 处理SIGTERM信号（进程终止）
process.on('SIGTERM', () => {
  Logger.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);  // 正常退出
});

// 🎯 程序启动点
// 调用启动函数，开始运行服务器
startServer(); 