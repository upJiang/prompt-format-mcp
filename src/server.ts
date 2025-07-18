import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SiliconFlowClient } from './api/siliconflow.js';
import { Logger, retry } from './utils/helpers.js';

export class PromptFormatMcpServer {
  private server: McpServer;
  private apiClient: SiliconFlowClient;

  constructor() {
    // 检查API密钥
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      throw new Error('SILICONFLOW_API_KEY environment variable is required');
    }

    // 创建API客户端
    this.apiClient = new SiliconFlowClient(
      apiKey,
      process.env.SILICONFLOW_BASE_URL,
      process.env.MODEL_NAME
    );

    // 创建MCP服务器
    this.server = new McpServer({
      name: "prompt-format-mcp",
      version: "1.0.11",
    }, {
      capabilities: {
        tools: {},
      },
    });

    // 注册工具
    this.registerTools();
  }

  private registerTools() {
    // 优化提示词工具
    this.server.tool(
      "optimize-prompt",
      "Optimize prompt for better AI model performance",
      {
        content: z.string().describe("Prompt content to optimize")
      },
      async ({ content }) => {
        try {
          Logger.log(`优化提示词，长度: ${content.length} 字符`);

          // 使用重试机制优化
          const optimized = await retry(
            () => this.apiClient.optimizePrompt(content),
            3,
            1000
          );

          // 只返回优化结果，由用户决定是否编辑和确认
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

          return {
            content: [
              {
                type: "text",
                text: result
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

    // 确认并继续对话工具
    this.server.tool(
      "confirm-and-continue",
      "Confirm the final prompt and signal ready for new conversation",
      {
        finalPrompt: z.string().describe("The final confirmed prompt to use for AI conversation")
      },
      async ({ finalPrompt }) => {
        try {
          Logger.log(`确认使用提示词，长度: ${finalPrompt.length} 字符`);

          // 返回格式化的确认信息，告诉AI立即基于新提示词工作
          const result = `✅ **提示词已确认并生效**

---

**🤖 新的AI角色设定**：

${finalPrompt}

---

**🚀 立即生效**

上述提示词已确认。现在，请作为一个专业的全栈AI网站开发顾问，基于上述角色设定，立即为用户的全栈AI网站开发需求提供详细的指导和建议。

**无需用户重新提问，请直接开始提供系统性的开发指导。**`;

          return {
            content: [
              {
                type: "text",
                text: result
              }
            ]
          };
        } catch (error: any) {
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
   * 启动 stdio 服务器
   */
  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    Logger.log("Prompt Format MCP Server started on stdio");
  }
} 