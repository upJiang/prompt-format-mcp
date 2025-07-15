#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';
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

// 创建readline接口
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// 发送JSON-RPC请求
async function sendRequest(request) {
  return new Promise((resolve, reject) => {
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

    // 发送请求
    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
  });
}

// 显示菜单
function showMenu() {
  console.log('\n📋 选择测试选项:');
  console.log('1. 列出所有工具');
  console.log('2. 检查API连接');
  console.log('3. 格式化提示词');
  console.log('4. 优化提示词');
  console.log('5. 分析提示词');
  console.log('6. 退出');
  console.log('=' .repeat(30));
}

// 获取用户输入
function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 测试工具列表
async function testToolsList() {
  console.log('\n🔧 获取工具列表...');
  const result = await sendRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });

  if (result.success) {
    console.log('✅ 可用工具:');
    result.response.result.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
    });
  } else {
    console.log('❌ 获取工具列表失败:', result.error);
  }
}

// 测试API连接
async function testConnection() {
  console.log('\n🔗 检查API连接...');
  const result = await sendRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "check-connection",
      arguments: {}
    }
  });

  if (result.success) {
    const content = result.response.result.content[0].text;
    console.log('✅ 连接状态:', content);
  } else {
    console.log('❌ 连接检查失败:', result.error);
  }
}

// 测试格式化
async function testFormat() {
  console.log('\n📝 格式化提示词测试');
  
  const content = await getUserInput('请输入要格式化的内容: ');
  if (!content) {
    console.log('❌ 内容不能为空');
    return;
  }

  console.log('选择格式化风格:');
  console.log('1. basic (基础)');
  console.log('2. professional (专业)');
  console.log('3. conversational (对话式)');
  console.log('4. technical (技术性)');
  
  const styleChoice = await getUserInput('请选择风格 (1-4): ');
  const styles = ['basic', 'professional', 'conversational', 'technical'];
  const style = styles[parseInt(styleChoice) - 1] || 'basic';

  console.log(`\n🔄 正在格式化 (风格: ${style})...`);
  
  const result = await sendRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "format-prompt",
      arguments: { content, style }
    }
  });

  if (result.success) {
    console.log('✅ 格式化结果:');
    console.log('=' .repeat(50));
    console.log(result.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 格式化失败:', result.error);
  }
}

// 测试优化
async function testOptimize() {
  console.log('\n⚡ 优化提示词测试');
  
  const content = await getUserInput('请输入要优化的提示词: ');
  if (!content) {
    console.log('❌ 内容不能为空');
    return;
  }

  console.log('\n🔄 正在优化...');
  
  const result = await sendRequest({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "optimize-prompt",
      arguments: { content }
    }
  });

  if (result.success) {
    console.log('✅ 优化结果:');
    console.log('=' .repeat(50));
    console.log(result.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 优化失败:', result.error);
  }
}

// 测试分析
async function testAnalyze() {
  console.log('\n🔍 分析提示词测试');
  
  const content = await getUserInput('请输入要分析的提示词: ');
  if (!content) {
    console.log('❌ 内容不能为空');
    return;
  }

  console.log('\n🔄 正在分析...');
  
  const result = await sendRequest({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "analyze-prompt",
      arguments: { content }
    }
  });

  if (result.success) {
    console.log('✅ 分析结果:');
    console.log('=' .repeat(50));
    console.log(result.response.result.content[0].text);
    console.log('=' .repeat(50));
  } else {
    console.log('❌ 分析失败:', result.error);
  }
}

// 主循环
async function main() {
  console.log('🚀 Prompt Format MCP 手动测试工具');
  console.log('=' .repeat(50));

  while (true) {
    showMenu();
    const choice = await getUserInput('请选择 (1-6): ');

    switch (choice) {
      case '1':
        await testToolsList();
        break;
      case '2':
        await testConnection();
        break;
      case '3':
        await testFormat();
        break;
      case '4':
        await testOptimize();
        break;
      case '5':
        await testAnalyze();
        break;
      case '6':
        console.log('👋 再见！');
        rl.close();
        return;
      default:
        console.log('❌ 无效选择，请重试');
    }
  }
}

main().catch(console.error); 