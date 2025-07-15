# Prompt Format MCP

一个基于 AI 的提示词格式化 MCP (Model Context Protocol) 服务器，可以自动将对话内容格式化为标准的提示词格式。

## 功能特点

- 🤖 **AI 驱动格式化**：使用 SiliconFlow 的 Qwen/QwQ-32B 模型进行智能格式化
- 📝 **多种格式风格**：支持基础、专业、对话式、技术性等多种格式化风格
- 🔍 **提示词分析**：分析提示词质量并提供改进建议
- ⚡ **优化功能**：自动优化提示词以提高 AI 模型理解度
- 🔧 **易于集成**：通过 npx 一键使用，无需本地安装
- 📊 **详细统计**：提供字符数、单词数、复杂度等统计信息

## 快速开始

### 在 Cursor 中使用

1. 打开 Cursor 的设置
2. 找到 "Model Context Protocol" 配置
3. 添加以下配置：

```json
{
  "prompt-format-mcp": {
    "command": "npx",
    "args": [
      "-y",
      "prompt-format-mcp",
      "--stdio"
    ],
    "env": {
      "SILICONFLOW_API_KEY": "your_api_key_here"
    }
  }
}
```

4. 重启 Cursor

### 获取 API 密钥

1. 访问 [SiliconFlow](https://siliconflow.cn/) 并注册账号
2. 获取 API 密钥
3. 将密钥添加到上述配置中

## 可用工具

### 1. format-prompt
格式化对话内容为标准提示词格式

**参数：**
- `content` (string): 要格式化的原始内容
- `style` (optional): 格式化风格
  - `basic`: 基础格式化（默认）
  - `professional`: 专业格式化
  - `conversational`: 对话式格式化
  - `technical`: 技术性格式化

**示例：**
```
请帮我格式化这段对话：
用户：你好，我想了解如何使用 React
助手：React 是一个用于构建用户界面的 JavaScript 库
```

### 2. optimize-prompt
优化提示词以提高 AI 模型理解度

**参数：**
- `content` (string): 要优化的提示词内容

**示例：**
```
请优化这个提示词：写一个关于猫的故事
```

### 3. analyze-prompt
分析提示词质量并提供改进建议

**参数：**
- `content` (string): 要分析的提示词内容

**示例：**
```
请分析这个提示词的质量：
你是一个专业的写作助手，请帮我写一篇文章
```

### 4. check-connection
检查 SiliconFlow API 连接状态

**参数：** 无

## 使用示例

### 基础格式化
```
请使用 format-prompt 工具格式化以下内容：
我想让你帮我写一个 Python 函数，用来计算斐波那契数列
```

### 专业格式化
```
请使用 format-prompt 工具，以 professional 风格格式化：
创建一个用户管理系统的 API 设计
```

### 提示词优化
```
请使用 optimize-prompt 工具优化：
帮我翻译这段文字
```

## 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的 API 密钥
```

### 开发模式
```bash
npm run dev
```

### 构建
```bash
npm run build
```

### 发布
```bash
npm run prepublishOnly
npm publish
```

## 技术架构

- **TypeScript**: 类型安全的 JavaScript
- **MCP SDK**: Model Context Protocol 实现
- **SiliconFlow API**: AI 模型调用
- **Zod**: 运行时类型验证
- **Axios**: HTTP 客户端

## 错误处理

- 自动重试机制（最多 3 次）
- 详细的错误信息
- 输入验证和清理
- 连接状态检查

## 限制

- 单次处理内容不超过 50,000 字符
- 依赖 SiliconFlow API 的可用性
- 需要有效的 API 密钥

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础格式化功能
- 集成 SiliconFlow API
- 支持多种格式化风格
