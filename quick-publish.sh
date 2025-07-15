#!/bin/bash

echo "🚀 Prompt Format MCP 快速发布脚本"
echo "=================================="

# 检查npm登录状态
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 未登录npm，请先运行: npm login"
    exit 1
fi

echo "✅ npm登录状态正常"

# 运行测试
echo "🧪 运行测试..."
if ! npm test; then
    echo "❌ 测试失败，请修复后重试"
    exit 1
fi

echo "✅ 测试通过"

# 构建项目
echo "🔨 构建项目..."
if ! npm run build; then
    echo "❌ 构建失败，请检查代码"
    exit 1
fi

echo "✅ 构建成功"

# 检查包名
echo "🔍 检查包名..."
if npm view prompt-format-mcp > /dev/null 2>&1; then
    echo "⚠️  包名已存在，请检查版本号"
    npm view prompt-format-mcp version
else
    echo "✅ 包名可用"
fi

# 预览发布内容
echo "📦 预览发布内容..."
npm pack --dry-run

# 确认发布
echo ""
echo "🚀 准备发布到npm..."
echo "包名: prompt-format-mcp"
echo "版本: $(node -p "require('./package.json').version")"
echo ""

read -p "确认发布? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 正在发布..."
    if npm publish; then
        echo "🎉 发布成功！"
        echo ""
        echo "📝 使用方法:"
        echo "npx prompt-format-mcp"
        echo ""
        echo "🔗 查看发布:"
        echo "https://www.npmjs.com/package/prompt-format-mcp"
        echo ""
        echo "✅ 验证发布:"
        npm view prompt-format-mcp
    else
        echo "❌ 发布失败，请检查错误信息"
        exit 1
    fi
else
    echo "❌ 发布已取消"
    exit 1
fi 