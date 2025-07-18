# Prompt Format MCP

一个简单高效的提示词优化 MCP (Model Context Protocol) 服务器，帮助用户快速优化提示词，提高AI对话质量。

## 功能特点

- 🤖 **AI 驱动优化**：使用 SiliconFlow 的 Qwen/QwQ-32B 模型智能优化提示词
- ✏️ **简单编辑确认**：直接返回优化结果，支持用户编辑
- 🚀 **通用兼容**：适用于所有 AI 客户端，不绑定特定平台
- 🔧 **易于集成**：通过 npx 一键使用，无需本地安装

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

### 1. optimize-prompt
优化提示词

**参数：**
- `content` (string): 要优化的提示词内容

**功能：**
- 智能优化提示词结构和表达
- 直接返回优化后的提示词

**示例：**
```
content: "我想做一个AI的全栈网站"
```

### 2. confirm-and-continue
确认提示词

**参数：**
- `finalPrompt` (string): 最终确认的提示词

**功能：**
- 确认并展示最终提示词
- 提示用户可以开始新对话

**示例：**
```
finalPrompt: "你是一个专业的全栈开发助手..."
```



## 使用示例

### 简单使用流程

**步骤 1：优化提示词**
```
使用 optimize-prompt 工具：
content: "我想做一个AI的全栈网站"
```

**步骤 2：查看优化结果**
工具返回优化后的提示词供您查看，例如：
```
你是一个专业的全栈开发助手，专门帮助用户设计和开发AI驱动的Web应用。

任务要求：
1. 分析技术需求和架构设计
2. 提供前端、后端、AI集成的完整方案
3. 给出具体的实现步骤和代码示例
4. 考虑性能优化和安全性

请基于用户的具体需求，提供详细的开发指导。
```

**步骤 3：用户编辑确认**
- 查看优化结果
- 根据需要编辑修改（可选）
- 确定最终要使用的提示词

**步骤 4：确认提示词**
```
使用 confirm-and-continue 工具：
finalPrompt: "[您最终确定的提示词]"
```

**步骤 5：开始基于新提示词的对话**
确认后，AI将基于您确认的提示词来回答您的问题。

### 核心优势
- ⚡ **简单高效**：只需两步即可完成提示词优化
- ✏️ **可编辑**：支持用户自定义修改
- 🔧 **通用兼容**：适用于所有AI客户端
- 🎯 **专注核心**：只做最重要的事情，不添加无关功能

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
