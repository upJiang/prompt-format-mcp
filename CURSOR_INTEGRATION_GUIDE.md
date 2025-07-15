# Cursor 集成指南

## 🎯 一键配置

### 第一步：获取API密钥
1. 访问 [SiliconFlow](https://siliconflow.cn/) 注册账号
2. 获取API密钥（格式：sk-xxxxxxxxxx）

### 第二步：配置Cursor
1. 打开Cursor
2. 按 `Cmd/Ctrl + ,` 打开设置
3. 搜索 "MCP" 或 "Model Context Protocol"
4. 点击 "Edit in settings.json"
5. 添加以下配置：

```json
{
  "mcpServers": {
    "prompt-format-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "prompt-format-mcp@1.0.3",
        "--stdio"
      ],
      "env": {
        "SILICONFLOW_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 第三步：重启Cursor
重启Cursor后，你就可以使用以下工具：

## 🛠️ 可用工具

### 1. format-prompt
**功能**: 格式化对话内容为标准提示词
**参数**: 
- `content`: 要格式化的内容
- `style`: 格式化风格（basic/professional/conversational/technical）

**使用示例**:
```
@prompt-format-mcp format-prompt 请帮我写一个关于机器学习的介绍
```

### 2. optimize-prompt
**功能**: 优化提示词以提高AI理解度
**参数**:
- `content`: 要优化的提示词

**使用示例**:
```
@prompt-format-mcp optimize-prompt 写一个程序
```

### 3. analyze-prompt
**功能**: 分析提示词质量并提供改进建议
**参数**:
- `content`: 要分析的提示词

**使用示例**:
```
@prompt-format-mcp analyze-prompt 请帮我分析一下这个提示词的质量
```

### 4. check-connection
**功能**: 检查API连接状态
**参数**: 无

**使用示例**:
```
@prompt-format-mcp check-connection
```

## 🔧 故障排除

### 常见问题
1. **工具未显示**: 确保Cursor已重启，且配置正确
2. **API连接失败**: 检查API密钥是否正确设置
3. **超时错误**: 检查网络连接，必要时使用VPN

### 调试步骤
1. 检查Cursor控制台是否有错误信息
2. 使用`check-connection`工具测试API连接
3. 确认使用的是最新版本：`prompt-format-mcp@1.0.2`

## 🎨 使用技巧

### 1. 批量格式化
可以一次性格式化多个对话片段：
```
@prompt-format-mcp format-prompt 
用户: 你好
助手: 你好！有什么我可以帮助你的吗？
用户: 我想了解机器学习
```

### 2. 风格选择
根据不同场景选择合适的风格：
- `basic`: 基础格式化，适合日常使用
- `professional`: 专业格式，适合商务场景
- `conversational`: 对话式，适合聊天场景
- `technical`: 技术性，适合开发场景

### 3. 内容优化工作流
1. 先用`format-prompt`格式化内容
2. 再用`optimize-prompt`优化表达
3. 最后用`analyze-prompt`检查质量

## 🚀 高级用法

### 自定义API配置
如果需要使用自定义API地址或模型，可以在环境变量中设置：
```json
{
  "env": {
    "SILICONFLOW_API_KEY": "your_api_key_here",
    "SILICONFLOW_BASE_URL": "https://api.siliconflow.cn/v1",
    "MODEL_NAME": "Qwen/QwQ-32B"
  }
}
```

### 批处理脚本
对于大量内容的处理，可以编写脚本批量调用工具。

## 📞 技术支持

如遇问题，请检查：
1. [故障排除指南](./TROUBLESHOOTING.md)
2. [使用示例](./USAGE_EXAMPLES.md)
3. [项目主页](https://github.com/yourusername/prompt-format-mcp)

---

**提示**: 首次使用时，npx会下载最新版本，可能需要等待几秒钟。 