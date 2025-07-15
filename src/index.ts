#!/usr/bin/env node
import { PromptFormatMcpServer } from "./server.js";
import { config } from "dotenv";
import { resolve } from "path";
import { Logger } from "./utils/helpers.js";

// 加载环境变量
config({ path: resolve(process.cwd(), ".env") });

// 检查必要的环境变量
if (!process.env.SILICONFLOW_API_KEY) {
  console.error("错误: 请设置环境变量 SILICONFLOW_API_KEY");
  console.error("您可以在 .env 文件中配置这个变量，例如：");
  console.error("SILICONFLOW_API_KEY=your_api_key_here");
  process.exit(1);
}

/**
 * 启动服务器
 */
export async function startServer(): Promise<void> {
  try {
    // 创建服务器实例
    const server = new PromptFormatMcpServer();
    
    // 启动stdio服务器
    Logger.log("启动 Prompt Format MCP 服务器...");
    await server.startStdio();
  } catch (error) {
    Logger.error("服务器启动失败:", error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  Logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 处理退出信号
process.on('SIGINT', () => {
  Logger.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer(); 