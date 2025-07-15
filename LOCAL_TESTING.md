# 本地测试指南

## 前置条件

1. **确保依赖已安装**
   ```bash
   npm install
   ```

2. **确保项目已构建**
   ```bash
   npm run build
   ```

3. **确保环境变量已配置**
   - 检查 `.env` 文件是否存在
   - 确认 `SILICONFLOW_API_KEY` 已设置

## 测试方法

### 1. 快速测试 (推荐)

测试服务器是否正常启动并能列出工具：

```bash
npm run test:quick
```

预期输出应包含工具列表的JSON响应。

### 2. 自动化测试

运行完整的自动化测试套件：

```bash
npm run test:local
```

这将测试所有4个工具：
- ✅ 工具列表
- ✅ API连接检查
- ✅ 基础格式化测试
- ✅ 专业格式化测试
- ✅ 提示词优化测试
- ✅ 提示词分析测试

### 3. 手动交互测试

启动交互式测试界面：

```bash
npm run test:manual
```

这将打开一个菜单，让你可以：
- 选择不同的工具进行测试
- 输入自定义内容
- 选择不同的格式化风格
- 实时查看结果

### 4. 直接命令行测试

你也可以直接使用命令行测试：

```bash
# 测试工具列表
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/index.js

# 测试API连接
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"check-connection","arguments":{}}}' | node dist/index.js

# 测试格式化
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"format-prompt","arguments":{"content":"写一个关于猫的故事","style":"basic"}}}' | node dist/index.js
```

## 测试场景

### 基本功能测试
- [x] 服务器启动
- [x] 工具列表获取
- [x] API连接检查
- [x] 基础格式化
- [x] 专业格式化
- [x] 对话式格式化
- [x] 技术性格式化
- [x] 提示词优化
- [x] 提示词分析

### 错误处理测试
- [x] 空内容处理
- [x] 无效格式风格
- [x] API连接失败
- [x] 超长内容处理
- [x] 网络超时处理

### 性能测试
- [x] 响应时间测试
- [x] 并发请求测试
- [x] 内存使用测试

## 常见问题

### 1. API连接失败

**问题**: `API连接失败` 或网络错误

**解决方案**:
- 检查 `.env` 文件中的 `SILICONFLOW_API_KEY` 是否正确
- 确认网络连接正常
- 检查防火墙设置

### 2. 依赖问题

**问题**: 模块找不到或导入错误

**解决方案**:
```bash
# 清理并重新安装依赖
rm -rf node_modules
npm install

# 重新构建
npm run build
```

### 3. 环境变量问题

**问题**: 环境变量未加载

**解决方案**:
- 确保 `.env` 文件在项目根目录
- 检查文件内容格式是否正确
- 尝试手动设置环境变量：
  ```bash
  export SILICONFLOW_API_KEY=your_api_key_here
  npm run test:local
  ```

### 4. 权限问题

**问题**: 无法执行测试脚本

**解决方案**:
```bash
# 给测试脚本执行权限
chmod +x test-local.js
chmod +x test-manual.js

# 或者直接用node运行
node test-local.js
node test-manual.js
```

## 测试数据

### 格式化测试用例
```
输入: "我想让你帮我写一个Python函数，用来计算斐波那契数列"
风格: basic
预期: 包含标题、任务描述、要求等结构化内容
```

### 优化测试用例
```
输入: "写一个关于猫的故事"
预期: 包含角色设定、任务要求、创作元素等详细内容
```

### 分析测试用例
```
输入: "你是一个专业的写作助手，请帮我写一篇文章"
预期: 包含质量评分、优点、改进建议等分析结果
```

## 调试技巧

### 1. 启用调试模式
```bash
NODE_ENV=development npm run test:local
```

### 2. 查看详细日志
```bash
# 查看服务器日志
npm run start 2>&1 | tee server.log

# 查看测试日志
npm run test:local 2>&1 | tee test.log
```

### 3. 手动发送请求
```bash
# 使用curl测试（如果有HTTP接口）
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  http://localhost:3000
```

## 性能基准

### 预期响应时间
- 工具列表: < 100ms
- API连接检查: < 2s
- 格式化: < 10s
- 优化: < 15s
- 分析: < 10s

### 内存使用
- 启动内存: < 50MB
- 运行内存: < 100MB
- 峰值内存: < 200MB

## 下一步

测试通过后，你可以：
1. 在Cursor中配置MCP服务器
2. 发布到npm
3. 部署到生产环境
4. 添加更多功能和测试用例 