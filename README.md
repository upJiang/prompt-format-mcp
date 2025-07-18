# 🚀 MCP开发完整教程：从零构建AI提示词优化服务器

> 本教程将带你从零开始构建一个完整的MCP (Model Context Protocol) 服务器，实现AI提示词优化功能。通过详细的代码注释和原理解析，你将学会如何创建、发布和使用MCP服务器。

## 📖 目录

1. [MCP概念介绍](#mcp概念介绍)
2. [项目架构解析](#项目架构解析)
3. [源码详解](#源码详解)
4. [Studio模式与工具交互](#studio模式与工具交互)
5. [发布与打包](#发布与打包)
6. [在Cursor中使用](#在cursor中使用)
7. [完整示例](#完整示例)

## 🎯 MCP概念介绍

### 什么是MCP？

Model Context Protocol (MCP) 是一个开放标准，用于连接AI助手与外部数据源和工具。它允许AI助手：

- 访问外部数据源
- 调用工具和函数
- 与各种服务集成
- 扩展AI能力

### MCP的核心组件

1. **MCP服务器** - 提供工具和资源的服务端
2. **MCP客户端** - 使用工具和资源的客户端（如Cursor）
3. **传输层** - 通信协议（stdio、HTTP等）
4. **工具系统** - 可调用的函数接口

## 🏗️ 项目架构解析

```
prompt-format-mcp/
├── src/
│   ├── index.ts           # 📍 入口文件 - 服务器启动和环境配置
│   ├── server.ts          # 🔧 核心服务器 - MCP服务器实现和工具注册
│   ├── api/
│   │   └── siliconflow.ts # 🌐 API客户端 - 第三方AI服务集成
│   ├── types/
│   │   └── index.ts       # 📝 类型定义 - TypeScript类型系统
│   └── utils/
│       └── helpers.ts     # 🛠️ 工具函数 - 日志、重试等通用功能
├── package.json           # 📦 依赖配置
├── tsconfig.json          # ⚙️ TypeScript编译配置
└── README.md              # 📖 本教程文档
```

### 设计理念

- **模块化设计** - 每个文件职责单一，便于维护
- **类型安全** - 使用TypeScript确保代码质量
- **错误处理** - 完善的重试机制和错误处理
- **标准化** - 遵循MCP协议标准

## 📚 源码详解

下面我们逐个文件详细解析每行代码的作用和原理。

### 1. 入口文件 (src/index.ts)

```typescript
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

// 🎯 程序启动点
// 调用启动函数，开始运行服务器
startServer();
```

**关键点解析：**
- **Shebang行**: 使文件可以直接执行
- **环境变量处理**: 支持.env文件和客户端配置两种方式
- **错误处理**: 完整的异常捕获和进程信号处理
- **启动流程**: 简洁的服务器启动逻辑

### 2. 核心服务器 (src/server.ts)

这是MCP服务器的核心文件，展示了完整的MCP服务器实现：

```typescript
// 🔧 导入MCP核心模块
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";      // MCP服务器核心类
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";  // stdio传输层
import { z } from "zod";                                                 // 参数验证和类型定义库

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

  constructor() {
    // 🔧 创建MCP服务器
    // 这是MCP协议的核心，定义了服务器的基本信息和能力
    this.server = new McpServer({
      name: "prompt-format-mcp",    // 服务器名称，客户端用此识别服务器
      version: "1.0.11",            // 服务器版本号
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
    this.registerTools();
  }

  /**
   * 🛠️ 工具注册方法
   * 这里注册所有MCP工具，每个工具都有特定的功能
   */
  private registerTools() {
    // 🔧 第一个工具：optimize-prompt
    this.server.tool(
      "optimize-prompt",                     // 工具名称，客户端调用时使用
      "Optimize prompt for better AI model performance",  // 工具描述
      {
        // 📋 参数模式定义
        // 使用zod库定义参数的类型和验证规则
        content: z.string().describe("Prompt content to optimize")
      },
      // 🎯 工具处理函数
      async ({ content }) => {
        // 🔄 使用重试机制调用AI API
        const optimized = await retry(
          () => this.apiClient.optimizePrompt(content),
          3,    // 最大重试次数
          1000  // 每次重试间隔（毫秒）
        );

        // 🎯 返回MCP标准响应格式
        return {
          content: [
            {
              type: "text",           // 内容类型：文本
              text: optimized         // 优化后的内容
            }
          ]
        };
      }
    );
  }

  /**
   * 🚀 启动stdio服务器
   * 这是MCP服务器的标准启动方法
   */
  async startStdio(): Promise<void> {
    // 🔌 创建stdio传输层
    const transport = new StdioServerTransport();
    
    // 🔗 连接服务器和传输层
    await this.server.connect(transport);
    
    Logger.log("MCP Server started on stdio");
  }
}
```

**关键概念解析：**

#### MCP服务器创建
```typescript
const server = new McpServer({
  name: "prompt-format-mcp",  // 服务器标识
  version: "1.0.11",          // 版本号
}, {
  capabilities: {
    tools: {},                // 声明支持的功能
  },
});
```

#### 工具注册机制
```typescript
server.tool(
  "tool-name",               // 工具名称
  "Tool description",        // 工具描述
  parameterSchema,           // 参数验证模式
  handlerFunction            // 处理函数
);
```

#### Studio模式通信
- **stdio传输**: 通过标准输入输出与客户端通信
- **JSON-RPC协议**: 使用JSON-RPC 2.0协议格式
- **异步处理**: 支持异步工具调用

### 3. API客户端 (src/api/siliconflow.ts)

展示了如何封装第三方AI API：

```typescript
export class SiliconFlowClient {
  private apiKey: string;     // API密钥
  private baseUrl: string;    // API基础URL
  private modelName: string;  // AI模型名称

  /**
   * 🔄 调用API的核心方法
   * 包含完整的错误处理和重试逻辑
   */
  private async callAPI(request: SiliconFlowRequest): Promise<SiliconFlowResponse> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 🌐 发送HTTP请求
        const response = await axios.post(
          `${this.baseUrl}/chat/completions`,
          request,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 90000,                    // 90秒超时
            validateStatus: (status) => status < 500  // 自定义状态码验证
          }
        );

        return response.data;
      } catch (error) {
        // 🔍 错误分类处理
        if (error.code === 'ECONNABORTED') {
          // 超时错误 - 重试
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
        }
        // 其他错误处理...
      }
    }
  }
}
```

**API设计要点：**
- **重试机制**: 自动重试失败的请求
- **错误分类**: 区分不同类型的错误
- **超时处理**: 设置合理的超时时间
- **状态码验证**: 自定义HTTP状态码处理

### 4. 类型定义 (src/types/index.ts)

```typescript
/**
 * 🤖 SiliconFlow API响应类型
 * 符合OpenAI兼容的API响应格式
 */
export interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;    // AI生成的内容
      role: string;       // 消息角色
    };
    finish_reason: string; // 结束原因
    index: number;        // 选择索引
  }>;
  usage: {
    completion_tokens: number;  // 生成的token数
    prompt_tokens: number;      // 输入的token数
    total_tokens: number;       // 总token数
  };
}
```

### 5. 工具函数 (src/utils/helpers.ts)

```typescript
/**
 * 🔄 重试函数
 * 提供自动重试机制，提高API调用的可靠性
 */
export async function retry<T>(
  fn: () => Promise<T>,      // 要重试的函数
  maxAttempts: number = 3,   // 最大重试次数
  delayMs: number = 1000     // 基础延迟时间
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        // 递增延迟：第一次1s，第二次2s，第三次3s
        await delay(delayMs * attempt);
      }
    }
  }

  throw lastError!;
}
```

**工具函数设计：**
- **泛型支持**: 支持任意类型的返回值
- **递增延迟**: 避免频繁重试对服务器造成压力
- **错误保留**: 保留最后一次错误信息

## 🔧 Studio模式与工具交互

### MCP服务器创建过程

1. **初始化服务器**
   ```typescript
   const server = new McpServer({
     name: "prompt-format-mcp",  // 服务器名称
     version: "1.0.11",          // 版本号
   }, {
     capabilities: {
       tools: {},                // 声明支持工具功能
     },
   });
   ```

2. **注册工具**
   ```typescript
   server.tool(
     "tool-name",               // 工具名称
     "Tool description",        // 工具描述
     schema,                    // 参数模式
     handler                    // 处理函数
   );
   ```

3. **启动服务器**
   ```typescript
   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

### 工具间协调机制

我们的项目实现了两个协调工具：

1. **optimize-prompt** - 优化提示词
2. **confirm-and-continue** - 确认并继续对话

这两个工具的协调流程：
```
用户输入 → optimize-prompt → 返回优化结果 → 用户确认 → confirm-and-continue → 触发AI继续对话
```

### 客户端处理流程

1. **客户端发起请求**
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "optimize-prompt",
       "arguments": {
         "content": "用户的提示词"
       }
     }
   }
   ```

2. **服务器处理并返回**
   ```json
   {
     "jsonrpc": "2.0",
     "result": {
       "content": [
         {
           "type": "text",
           "text": "优化后的结果"
         }
       ]
     }
   }
   ```

## 📦 发布与打包

### 1. 构建项目

```bash
# 编译TypeScript到JavaScript
npm run build

# 编译后的文件在dist/目录
```

### 2. 配置package.json

```json
{
  "name": "prompt-format-mcp",
  "version": "1.0.11",
  "type": "module",              // 使用ES模块
  "main": "dist/index.js",       // 入口文件
  "bin": {
    "prompt-format-mcp": "dist/index.js"  // 命令行工具
  },
  "files": [
    "dist",                      // 只包含编译后的文件
    "README.md"
  ]
}
```

### 3. 发布到npm

```bash
# 登录npm账户
npm login

# 发布包
npm publish
```

### 4. 版本管理

```bash
# 更新版本号并发布
npm version patch  # 补丁版本 1.0.11 → 1.0.12
npm version minor  # 次要版本 1.0.11 → 1.1.0
npm version major  # 主要版本 1.0.11 → 2.0.0
```

## 🎯 在Cursor中使用

### 1. 配置MCP服务器

在Cursor中创建或编辑 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "prompt-format-mcp": {
      "command": "npx",
      "args": ["-y", "prompt-format-mcp@latest", "--stdio"],
      "env": {
        "SILICONFLOW_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 2. 配置说明

- **command**: 使用npx运行，无需本地安装
- **args**: 
  - `-y`: 自动确认安装
  - `--stdio`: 使用stdio传输模式
- **env**: 环境变量配置

### 3. 重启Cursor

配置完成后重启Cursor，MCP服务器会自动启动。

### 4. 使用示例

```
# 优化提示词
@prompt-format-mcp optimize-prompt 我想做一个网站

# 确认并继续（在优化结果后使用）
@prompt-format-mcp confirm-and-continue 这是我确认的最终提示词...
```

## 🎮 完整示例

### 开发自己的MCP服务器

1. **创建项目结构**
   ```bash
   mkdir my-mcp-server
   cd my-mcp-server
   npm init -y
   npm install @modelcontextprotocol/sdk axios zod
   npm install -D typescript @types/node tsx
   ```

2. **创建基础文件**
   ```typescript
   // src/server.ts
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   import { z } from "zod";

   export class MyMcpServer {
     private server: McpServer;

     constructor() {
       this.server = new McpServer({
         name: "my-mcp-server",
         version: "1.0.0",
       }, {
         capabilities: {
           tools: {},
         },
       });

       this.registerTools();
     }

     private registerTools() {
       // 注册你的工具
       this.server.tool(
         "hello-world",
         "Say hello to the world",
         {
           name: z.string().describe("Name to greet")
         },
         async ({ name }) => {
           return {
             content: [
               {
                 type: "text",
                 text: `Hello, ${name}! Welcome to MCP!`
               }
             ]
           };
         }
       );
     }

     async startStdio(): Promise<void> {
       const transport = new StdioServerTransport();
       await this.server.connect(transport);
     }
   }
   ```

3. **创建入口文件**
   ```typescript
   // src/index.ts
   #!/usr/bin/env node
   import { MyMcpServer } from "./server.js";

   async function main() {
     const server = new MyMcpServer();
     await server.startStdio();
   }

   main().catch(console.error);
   ```

4. **配置TypeScript**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "node",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist"]
   }
   ```

5. **构建和测试**
   ```bash
   # 构建
   npx tsc

   # 测试
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js
   ```

## 🎉 总结

通过这个教程，你学到了：

1. **MCP基础概念** - 理解MCP协议和架构
2. **服务器开发** - 创建MCP服务器和工具注册
3. **工具协调** - 实现工具间的协调和交互
4. **客户端集成** - 在Cursor中配置和使用MCP服务器
5. **发布流程** - 将MCP服务器发布到npm

MCP开发的核心在于：
- 理解stdio通信协议
- 正确注册和实现工具
- 处理错误和异常
- 提供良好的用户体验

现在你可以开始构建自己的MCP服务器了！🚀

## 🔗 相关资源

- [MCP官方文档](https://modelcontextprotocol.io)
- [MCP SDK文档](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP集成指南](https://cursor.com/docs/mcp)

---

**作者**: MCP开发教程
**版本**: 1.0.11
**更新时间**: 2024年12月
