# 发布指南

## 发布前准备

### 1. 环境要求
- Node.js >= 18.0.0
- npm 账户
- 项目已构建并测试通过

### 2. 检查清单
- [ ] 所有测试通过
- [ ] 代码已构建到 `dist/` 目录
- [ ] README.md 完整
- [ ] package.json 信息正确
- [ ] 环境变量配置文档完整

## 发布步骤

### 步骤1: 登录npm
```bash
npm login
```
输入你的npm用户名、密码和邮箱。

### 步骤2: 运行发布准备脚本
```bash
node prepare-publish.js
```
这将检查所有必要条件。

### 步骤3: 检查包名可用性
```bash
npm view prompt-format-mcp
```
如果包名已存在，需要更改包名或版本号。

### 步骤4: 预览发布内容
```bash
npm pack --dry-run
```
查看将要发布的文件列表。

### 步骤5: 发布
```bash
npm publish
```

### 步骤6: 验证发布
```bash
npm view prompt-format-mcp
```

## 发布后验证

### 1. 全局安装测试
```bash
npm install -g prompt-format-mcp
prompt-format-mcp
```

### 2. npx使用测试
```bash
npx prompt-format-mcp
```

### 3. 在Cursor中配置测试
将以下配置添加到Cursor的MCP设置中：
```json
{
  "mcpServers": {
    "prompt-format-mcp": {
      "command": "npx",
      "args": ["prompt-format-mcp"]
    }
  }
}
```

## 版本管理

### 更新版本
```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

### 发布新版本
```bash
npm version patch
npm publish
```

## 常见问题

### Q: 包名已存在怎么办？
A: 可以：
1. 更改包名（在package.json中）
2. 如果是你的包，更新版本号

### Q: 发布失败怎么办？
A: 检查：
1. 是否已登录npm
2. 包名是否可用
3. 版本号是否正确
4. 网络连接是否正常

### Q: 如何撤销发布？
A: 发布后24小时内可以撤销：
```bash
npm unpublish prompt-format-mcp@1.0.0
```

### Q: 如何更新包信息？
A: 修改package.json后重新发布新版本。

## 最佳实践

1. **版本号规范**: 遵循语义化版本控制
2. **测试充分**: 发布前确保所有功能正常
3. **文档完整**: 保持README和示例更新
4. **安全检查**: 不要包含敏感信息
5. **备份重要**: 发布前备份项目

## 发布检查表

发布前请确认：
- [ ] 代码已提交到git
- [ ] 版本号已更新
- [ ] 测试全部通过
- [ ] 文档已更新
- [ ] 环境变量示例完整
- [ ] 包名可用
- [ ] 已登录npm
- [ ] 发布内容正确

## 支持

如果遇到发布问题，可以：
1. 查看npm官方文档
2. 检查项目日志
3. 联系维护者

---

**注意**: 发布到npm是公开的，请确保不包含任何敏感信息！ 