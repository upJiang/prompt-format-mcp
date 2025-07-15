import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SiliconFlowClient } from './api/siliconflow.js';
import { FormatStyle } from './types/index.js';
import { validateContent, validateFormatStyle, sanitizeContent, isAlreadyFormatted, estimateComplexity } from './utils/validation.js';
import { Logger, retry, getTextStats } from './utils/helpers.js';

export class PromptFormatMcpServer {
  private server: McpServer;
  private apiClient: SiliconFlowClient;

  constructor() {
    // 检查API密钥
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('SILICONFLOW_API_KEY environment variable is required');
    }

    // 调试信息
    Logger.log(`环境变量加载状态:`);
    Logger.log(`- API Key: ${apiKey ? `已设置 (长度: ${apiKey.length})` : '未设置'}`);
    Logger.log(`- Base URL: ${process.env.SILICONFLOW_BASE_URL || '使用默认值'}`);
    Logger.log(`- Model: ${process.env.MODEL_NAME || '使用默认值'}`);

    // 创建API客户端
    this.apiClient = new SiliconFlowClient(
      apiKey,
      process.env.SILICONFLOW_BASE_URL,
      process.env.MODEL_NAME
    );

    // 创建MCP服务器
    this.server = new McpServer({
      name: "prompt-format-mcp",
      version: "1.0.0",
    }, {
      capabilities: {
        tools: {},
      },
    });

    // 注册工具
    this.registerTools();
  }

  private registerTools() {
    // 格式化提示词工具
    this.server.tool(
      "format-prompt",
      "Format dialogue content into standard prompt format using AI",
      {
        content: z.string().describe("Raw content to format"),
        style: z.enum(["basic", "professional", "conversational", "technical"]).optional().describe("Formatting style (default: basic)")
      },
      async ({ content, style = "basic" }) => {
        try {
          // 验证输入
          const contentValidation = validateContent(content);
          if (!contentValidation.isValid) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `输入验证失败: ${contentValidation.error}`
                }
              ]
            };
          }

          const styleValidation = validateFormatStyle(style);
          if (!styleValidation.isValid) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `格式风格验证失败: ${styleValidation.error}`
                }
              ]
            };
          }

          // 清理输入内容
          const sanitizedContent = sanitizeContent(content);
          
          // 检查是否已经格式化
          if (isAlreadyFormatted(sanitizedContent)) {
            Logger.warn("内容可能已经格式化");
          }

          // 获取内容统计信息
          const stats = getTextStats(sanitizedContent);
          Logger.log(`处理内容: ${stats.characters} 字符, ${stats.words} 单词, ${stats.lines} 行`);

          // 使用重试机制格式化
          const formatted = await retry(
            () => this.apiClient.formatPrompt(sanitizedContent, style as FormatStyle),
            3,
            1000
          );

          return {
            content: [
              {
                type: "text",
                text: formatted
              }
            ]
          };
        } catch (error: any) {
          Logger.error("格式化失败:", error);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `格式化失败: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // 优化提示词工具
    this.server.tool(
      "optimize-prompt",
      "Optimize prompt for better AI model performance",
      {
        content: z.string().describe("Prompt content to optimize")
      },
      async ({ content }) => {
        try {
          // 验证输入
          const validation = validateContent(content);
          if (!validation.isValid) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `输入验证失败: ${validation.error}`
                }
              ]
            };
          }

          const sanitizedContent = sanitizeContent(content);
          const complexity = estimateComplexity(sanitizedContent);
          Logger.log(`优化提示词，复杂度: ${complexity}`);

          // 使用重试机制优化
          const optimized = await retry(
            () => this.apiClient.optimizePrompt(sanitizedContent),
            3,
            1000
          );

          return {
            content: [
              {
                type: "text",
                text: optimized
              }
            ]
          };
        } catch (error: any) {
          Logger.error("优化失败:", error);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `优化失败: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // 分析提示词质量工具
    this.server.tool(
      "analyze-prompt",
      "Analyze prompt quality and provide improvement suggestions",
      {
        content: z.string().describe("Prompt content to analyze")
      },
      async ({ content }) => {
        try {
          // 验证输入
          const validation = validateContent(content);
          if (!validation.isValid) {
            return {
              isError: true,
              content: [
                {
                  type: "text",
                  text: `输入验证失败: ${validation.error}`
                }
              ]
            };
          }

          const sanitizedContent = sanitizeContent(content);
          const stats = getTextStats(sanitizedContent);
          const complexity = estimateComplexity(sanitizedContent);
          const alreadyFormatted = isAlreadyFormatted(sanitizedContent);

          Logger.log(`分析提示词: ${stats.characters} 字符, 复杂度: ${complexity}, 已格式化: ${alreadyFormatted}`);

          // 使用重试机制分析
          const analysis = await retry(
            () => this.apiClient.analyzePrompt(sanitizedContent),
            3,
            1000
          );

          // 添加基础统计信息
          const fullAnalysis = `## 基础统计信息
- 字符数: ${stats.characters}
- 单词数: ${stats.words}
- 行数: ${stats.lines}
- 段落数: ${stats.paragraphs}
- 复杂度: ${complexity}
- 已格式化: ${alreadyFormatted ? '是' : '否'}

## AI 分析结果
${analysis}`;

          return {
            content: [
              {
                type: "text",
                text: fullAnalysis
              }
            ]
          };
        } catch (error: any) {
          Logger.error("分析失败:", error);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `分析失败: ${error.message}`
              }
            ]
          };
        }
      }
    );

    // 检查API连接工具
    this.server.tool(
      "check-connection",
      "Check SiliconFlow API connection status",
      {},
      async () => {
        try {
          const isConnected = await this.apiClient.checkConnection();
          
          return {
            content: [
              {
                type: "text",
                text: isConnected ? "API连接正常" : "API连接失败"
              }
            ]
          };
        } catch (error: any) {
          Logger.error("连接检查失败:", error);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `连接检查失败: ${error.message}`
              }
            ]
          };
        }
      }
    );
  }

  /**
   * 启动 stdio 服务器
   */
  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    Logger.log("Prompt Format MCP Server started on stdio");
  }
} 