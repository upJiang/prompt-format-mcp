#!/usr/bin/env node

import { spawn } from 'child_process';
import { createReadStream } from 'fs';
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

// 测试用例
const testCases = [
  {
    name: "获取工具列表",
    request: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    }
  },
  {
    name: "提示词优化测试",
    request: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "optimize-prompt",
        arguments: {
          content: "我想做一个AI的全栈网站"
        }
      }
    }
  },
  {
    name: "确认提示词测试",
    request: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "confirm-and-continue",
        arguments: {
          finalPrompt: "你是一个专业的全栈开发助手，专门帮助用户设计和开发AI驱动的Web应用。"
        }
      }
    }
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n=== ${testCase.name} ===`);
    
    const child = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
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
      try {
        if (code !== 0) {
          console.log(`❌ 进程退出码: ${code}`);
          console.log('错误输出:', errorOutput);
          resolve(false);
          return;
        }

        const response = extractJsonResponse(output);
        console.log('✅ 响应:', JSON.stringify(response, null, 2));
        resolve(true);
      } catch (error) {
        console.log(`❌ 解析响应失败: ${error.message}`);
        console.log('原始输出:', output);
        console.log('错误输出:', errorOutput);
        resolve(false);
      }
    });

    // 发送请求
    child.stdin.write(JSON.stringify(testCase.request) + '\n');
    child.stdin.end();
  });
}

async function runAllTests() {
  console.log('🚀 开始运行 MCP 服务器测试...\n');
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const success = await runTest(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n📊 测试结果汇总:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 总计: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n💥 有测试失败！');
    process.exit(1);
  }
}

// 检查 dist 目录是否存在
import { existsSync } from 'fs';

if (!existsSync(join(__dirname, 'dist', 'index.js'))) {
  console.log('❌ 找不到构建文件。请先运行: npm run build');
  process.exit(1);
}

runAllTests().catch(console.error); 