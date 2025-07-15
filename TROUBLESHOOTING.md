# Prompt Format MCP 故障排除指南

## 常见问题及解决方案

### 1. 网络超时问题

**问题**: 出现 "timeout of 60000ms exceeded" 错误

**原因**: 
- 网络连接较慢
- API服务器响应时间过长
- 防火墙或代理设置

**解决方案**:
1. 检查网络连接
2. 尝试使用VPN或更换网络环境
3. 稍后重试

### 2. API Key问题

**问题**: API调用失败，401错误

**原因**: 
- API Key无效或过期
- API Key未正确设置

**解决方案**:
1. 检查API Key是否正确设置
2. 确认API Key格式正确（应该以 `sk-` 开头）
3. 联系SiliconFlow确认API Key状态

### 3. 环境变量问题

**问题**: 环境变量SILICONFLOW_API_KEY未设置

**解决方案**:
在Cursor的MCP配置中确保正确设置：
```json
{
  "mcpServers": {
    "prompt-format-mcp": {
      "command": "npx",
      "args": ["-y", "prompt-format-mcp@1.0.2", "--stdio"],
      "env": {
        "SILICONFLOW_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### 4. 工具未找到问题

**问题**: "Tool check_connection not found"

**原因**: 
- 使用了旧版本的包
- 包未正确安装

**解决方案**:
1. 确保使用最新版本：`prompt-format-mcp@1.0.2`
2. 清除npx缓存：`npx clear-npx-cache`
3. 重新安装：`npx -y prompt-format-mcp@1.0.2`

### 5. 调试方法

#### 检查包版本
```bash
npm view prompt-format-mcp version
```

#### 测试API连接
```bash
# 设置环境变量
export SILICONFLOW_API_KEY="your-api-key"
# 测试连接
npx prompt-format-mcp@1.0.2 --stdio
```

#### 查看详细日志
在MCP服务器启动时会显示环境变量加载状态，检查日志输出。

### 6. 版本更新

如果遇到问题，建议更新到最新版本：

1. 在Cursor配置中指定版本：
```json
"args": ["-y", "prompt-format-mcp@1.0.2", "--stdio"]
```

2. 或者清除缓存后重新安装：
```bash
npx clear-npx-cache
npx -y prompt-format-mcp@1.0.2
```

### 7. 联系支持

如果问题仍然存在，请提供以下信息：
- 错误信息的完整内容
- 使用的版本号
- 网络环境信息
- Cursor配置文件内容（请隐藏API Key）

## 性能优化建议

1. **网络优化**: 使用稳定的网络连接
2. **缓存**: npx会缓存包，首次运行可能较慢
3. **并发**: 避免同时进行多个API调用
4. **内容长度**: 过长的内容可能导致处理时间增加

## 已知限制

1. **API调用频率**: SiliconFlow API有调用频率限制
2. **内容长度**: 超长文本可能影响处理速度
3. **网络依赖**: 需要稳定的网络连接

## 更新日志

- **v1.0.2**: 修复超时错误处理，增加调试信息
- **v1.0.1**: 优化错误信息显示
- **v1.0.0**: 初始版本发布 