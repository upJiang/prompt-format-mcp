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
  console.log('🚀 简单测试 Prompt Format MCP 服务器');
  console.log('=' .repeat(50));

  // 测试1: 工具列表
  console.log('\n1. 测试工具列表...');
  const toolsResult = await sendRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });

  if (toolsResult.success) {
    console.log('✅ 工具列表获取成功');
    console.log('可用工具:', toolsResult.response.result.tools.map(t => t.name).join(', '));
  } else {
    console.log('❌ 工具列表获取失败:', toolsResult.error);
    return;
  }

  // 测试2: API连接
  console.log('\n2. 测试API连接...');
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
    console.log('✅ API连接测试成功');
    console.log('连接状态:', connectionResult.response.result.content[0].text);
  } else {
    console.log('❌ API连接测试失败:', connectionResult.error);
  }

  // 测试3: 基础格式化
  console.log('\n3. 测试基础格式化...');
  const formatResult = await sendRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "format-prompt",
      arguments: {
        content: "写一个简单的Python函数",
        style: "basic"
      }
    }
  });

  if (formatResult.success) {
    console.log('✅ 基础格式化测试成功');
    console.log('格式化结果预览:', formatResult.response.result.content[0].text.substring(0, 100) + '...');
  } else {
    console.log('❌ 基础格式化测试失败:', formatResult.error);
  }

  console.log('\n🎉 简单测试完成！');
}

main().catch(console.error); 