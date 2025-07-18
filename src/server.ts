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

          // 提供结构化的优化结果和下一步指引
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

**方式一：直接使用优化结果**
如果您对优化结果满意，请使用 \`confirm-and-continue\` 工具：
- 将上面的优化后提示词复制到 \`finalPrompt\` 参数中

**方式二：编辑后使用** 
如果您想修改优化结果：
1. 复制上面的优化后提示词
2. 根据需要进行编辑修改  
3. 使用 \`confirm-and-continue\` 工具提交您的最终版本

> 💡 **重要**: 使用 \`confirm-and-continue\` 后，AI将基于您确认的提示词来回答您的问题。`;

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

          // 返回格式化的确认信息，明确指示AI基于新提示词工作
          const result = `✅ **提示词已确认并生效**

---

**🤖 AI角色设定**：

${finalPrompt}

---

**🚀 准备就绪**

上述提示词已确认并生效。我现在将基于这个提示词为您提供服务。

**请重新提出您的问题**，我会按照上述角色设定来为您提供专业的回答和建议。

> 💡 对话模式已切换，请开始您的咨询。`;

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