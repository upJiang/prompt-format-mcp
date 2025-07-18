// 🔧 导入MCP核心模块
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";      // MCP服务器核心类
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";  // stdio传输层
import { z } from "zod";                                                 // 参数验证和类型定义库
import { SiliconFlowClient } from './api/siliconflow.js';                // 我们的AI API客户端
import { Logger, retry } from './utils/helpers.js';                     // 日志和重试工具

/**
 * 🎯 Prompt Format MCP 服务器类
 * 这是整个MCP服务器的核心类，负责：
 * 1. 创建和配置MCP服务器实例
 * 2. 注册和管理工具
 * 3. 处理客户端请求
 * 4. 管理与AI API的通信
 */
export class PromptFormatMcpServer {
  private server: McpServer;           // MCP服务器实例
  private apiClient: SiliconFlowClient; // AI API客户端实例

  /**
   * 🏗️ 构造函数
   * 初始化MCP服务器和相关组件
   */
  constructor() {
    // 🔐 API密钥验证
    // 从环境变量中获取SiliconFlow API密钥
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      // 如果没有API密钥，抛出错误
      throw new Error('SILICONFLOW_API_KEY environment variable is required');
    }

    // 🌐 创建API客户端
    // 使用API密钥和可选的配置创建SiliconFlow客户端
    this.apiClient = new SiliconFlowClient(
      apiKey,                                    // API密钥
      process.env.SILICONFLOW_BASE_URL,         // 可选：API基础URL
      process.env.MODEL_NAME                     // 可选：模型名称
    );

    // 🔧 创建MCP服务器
    // 这是MCP协议的核心，定义了服务器的基本信息和能力
    this.server = new McpServer({
      name: "prompt-format-mcp",    // 服务器名称，客户端用此识别服务器
      version: "1.1.1",            // 服务器版本号
    }, {
      capabilities: {
        tools: {},                  // 声明此服务器支持工具功能
        // 其他可能的能力：
        // resources: {},           // 资源功能
        // prompts: {},             // 提示词模板功能
        // logging: {},             // 日志功能
      },
    });

    // 📝 注册工具
    // 调用工具注册方法，添加所有可用的工具
    this.registerTools();
  }

  /**
   * 🛠️ 工具注册方法
   * 这里注册所有MCP工具，每个工具都有特定的功能
   */
  private registerTools() {
    // 🔧 第一个工具：optimize-prompt
    // 这个工具负责优化用户的提示词
    this.server.tool(
      "optimize-prompt",                     // 工具名称，客户端调用时使用
      "Optimize prompt for better AI model performance",  // 工具描述，帮助用户理解功能
      {
        // 📋 参数模式定义
        // 使用zod库定义参数的类型和验证规则
        content: z.string().describe("Prompt content to optimize")  // 必需的字符串参数
      },
      // 🎯 工具处理函数
      // 这是工具的核心逻辑，当客户端调用时执行
      async ({ content }) => {
        try {
          // 📊 记录请求信息
          Logger.log(`优化提示词，长度: ${content.length} 字符`);

          // 🔄 使用重试机制调用AI API
          // retry函数会在失败时自动重试，提高成功率
          const optimized = await retry(
            () => this.apiClient.optimizePrompt(content),  // 要执行的函数
            3,                                            // 最大重试次数
            1000                                          // 每次重试间隔（毫秒）
          );

          // 📝 构造返回结果
          // 返回格式化的优化结果，包含原始和优化后的提示词
          const result = `## 🔧 提示词优化结果

### 原始提示词
\`\`\`
${content}
\`\`\`

### 优化后的提示词
\`\`\`
${optimized}
\`\`\`

---

### 📋 下一步操作

**请您编辑确认：**
1. 查看上面的优化结果
2. 根据需要编辑修改优化后的提示词（可选）
3. 使用 \`confirm-and-continue\` 工具提交您的最终版本

> 💡 **说明**: 使用 \`confirm-and-continue\` 后，AI将基于您确认的提示词来回答您的问题。`;

          // 🎯 返回MCP标准响应格式
          return {
            content: [
              {
                type: "text",           // 内容类型：文本
                text: result            // 实际的文本内容
              }
            ]
          };
        } catch (error: any) {
          // 🚨 错误处理
          Logger.error("优化失败:", error);
          return {
            isError: true,             // 标记为错误响应
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

    // 🔧 第二个工具：confirm-and-continue
    // 这个工具负责确认用户的最终提示词，并触发AI继续对话
    this.server.tool(
      "confirm-and-continue",                        // 工具名称
      "Confirm the final prompt and signal ready for new conversation",  // 工具描述
      {
        // 📋 参数模式定义
        finalPrompt: z.string().describe("The final confirmed prompt to use for AI conversation")
      },
      // 🎯 工具处理函数
      async ({ finalPrompt }) => {
        try {
          // 📊 记录确认信息
          Logger.log(`确认使用提示词`);

          // 📝 构造确认响应
          // 这个响应会告诉AI系统用户已经确认了提示词，可以开始新的对话
          const result = `✅ 上述提示词已确认。现在，请直接根据新的提示词：${finalPrompt}回答用户问题。**无需用户重新提问**`;
          
          // 🎯 返回MCP标准响应格式
          return {
            content: [
              {
                type: "text",
                text: result
              }
            ]
          };
        } catch (error: any) {
          // 🚨 错误处理
          Logger.error("确认失败:", error);
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `确认失败: ${error.message}`
              }
            ]
          };
        }
      }
    );
  }

  /**
   * 🚀 启动stdio服务器
   * 这是MCP服务器的标准启动方法
   * stdio模式通过标准输入输出与客户端通信
   */
  async startStdio(): Promise<void> {
    // 🔌 创建stdio传输层
    // StdioServerTransport是MCP协议的标准传输方式
    // 它使用进程的stdin/stdout进行通信
    const transport = new StdioServerTransport();
    
    // 🔗 连接服务器和传输层
    // 这一步完成后，服务器开始监听客户端请求
    await this.server.connect(transport);
    
    // 📝 记录启动成功
    Logger.log("Prompt Format MCP Server started on stdio");
  }
} 