#!/usr/bin/env node

import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 从输出中提取JSON响应
function extractJsonResponse(output) {
  const lines = output.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"jsonrpc"')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // 继续寻找
      }
    }
  }
  throw new Error('未找到有效的JSON响应');
}

// 发送请求
async function sendRequest(request) {
  return new Promise((resolve) => {
    const child = spawn('node', [join(__dirname, 'dist', 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false, error: errorOutput });
        return;
      }

      try {
        const response = extractJsonResponse(output);
        resolve({ success: true, response });
      } catch (e) {
        resolve({ success: false, error: e.message, rawOutput: output });
      }
    });

    child.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
  });
}

async function main() {
  console.log('🚀 Prompt Format MCP 演示测试');
  console.log('=' .repeat(50));

  // 演示1: 工具列表
  console.log('\n📋 1. 获取工具列表');
  console.log('-'.repeat(30));
  const toolsResult = await sendRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });

  if (toolsResult.success) {
    console.log('✅ 可用工具:');
    toolsResult.response.result.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
    });
  } else {
    console.log('❌ 获取失败:', toolsResult.error);
  }

  // 演示2: API连接检查
  console.log('\n🔗 2. 检查API连接');
  console.log('-'.repeat(30));
  const connectionResult = await sendRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "check-connection",
      arguments: {}
    }
  });

  if (connectionResult.success) {
    console.log('✅ 连接状态:', connectionResult.response.result.content[0].text);
  } else {
    console.log('❌ 连接失败:', connectionResult.error);
  }

  // 演示3: 基础格式化
  console.log('\n📝 3. 基础格式化演示');
  console.log('-'.repeat(30));
  const testContent = "我需要一个能够处理用户登录的Python函数";
  console.log('输入:', testContent);
  
  const formatResult = await sendRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "format-prompt",
      arguments: {
        content: testContent,
        style: "basic"
      }
    }
  });

  if (formatResult.success) {
    console.log('✅ 格式化结果:');
    console.log('=' .repeat(50));
    console.log(formatResult.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 格式化失败:', formatResult.error);
  }

  // 演示4: 专业格式化
  console.log('\n💼 4. 专业格式化演示');
  console.log('-'.repeat(30));
  const professionalContent = "设计一个微服务架构的用户认证系统";
  console.log('输入:', professionalContent);
  
  const professionalResult = await sendRequest({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "format-prompt",
      arguments: {
        content: professionalContent,
        style: "professional"
      }
    }
  });

  if (professionalResult.success) {
    console.log('✅ 专业格式化结果:');
    console.log('=' .repeat(50));
    console.log(professionalResult.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 专业格式化失败:', professionalResult.error);
  }

  // 演示5: 提示词优化
  console.log('\n⚡ 5. 提示词优化演示');
  console.log('-'.repeat(30));
  const optimizeContent = "写一个故事";
  console.log('输入:', optimizeContent);
  
  const optimizeResult = await sendRequest({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "optimize-prompt",
      arguments: {
        content: optimizeContent
      }
    }
  });

  if (optimizeResult.success) {
    console.log('✅ 优化结果:');
    console.log('=' .repeat(50));
    console.log(optimizeResult.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 优化失败:', optimizeResult.error);
  }

  // 演示6: 提示词分析
  console.log('\n🔍 6. 提示词分析演示');
  console.log('-'.repeat(30));
  const analyzeContent = "你是一个专业的代码审查员，请帮我检查这段代码";
  console.log('输入:', analyzeContent);
  
  const analyzeResult = await sendRequest({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "analyze-prompt",
      arguments: {
        content: analyzeContent
      }
    }
  });

  if (analyzeResult.success) {
    console.log('✅ 分析结果:');
    console.log('=' .repeat(50));
    console.log(analyzeResult.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 分析失败:', analyzeResult.error);
  }

  console.log('\n🎉 演示完成！');
  console.log('\n💡 使用方法:');
  console.log('1. 运行 `npm run test:quick` 进行快速测试');
  console.log('2. 运行 `npm run test:local` 进行完整测试');
  console.log('3. 运行 `npm run test:manual` 进行交互式测试');
  console.log('4. 在Cursor中配置MCP服务器开始使用');
}

main().catch(console.error); 