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
    name: "工具列表",
    request: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    }
  },
  {
    name: "API连接检查",
    request: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "check-connection",
        arguments: {}
      }
    }
  },
  {
    name: "基础格式化测试",
    request: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "format-prompt",
        arguments: {
          content: "我想让你帮我写一个Python函数，用来计算斐波那契数列",
          style: "basic"
        }
      }
    }
  },
  {
    name: "专业格式化测试",
    request: {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "format-prompt",
        arguments: {
          content: "创建一个用户管理系统的API设计",
          style: "professional"
        }
      }
    }
  },
  {
    name: "提示词优化测试",
    request: {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "optimize-prompt",
        arguments: {
          content: "写一个关于猫的故事"
        }
      }
    }
  },
  {
    name: "提示词分析测试",
    request: {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "analyze-prompt",
        arguments: {
          content: "你是一个专业的写作助手，请帮我写一篇文章"
        }
      }
    }
  }
];

// 运行单个测试
async function runTest(testCase) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 测试: ${testCase.name}`);
    console.log('=' .repeat(50));
    
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
        console.log(`❌ 测试失败 (退出码: ${code})`);
        if (errorOutput) {
          console.log('错误输出:', errorOutput);
        }
        resolve({ success: false, error: errorOutput });
        return;
      }

      try {
        const response = extractJsonResponse(output);
        console.log('✅ 测试成功');
        console.log('响应:', JSON.stringify(response, null, 2));
        resolve({ success: true, response });
      } catch (e) {
        console.log('❌ 解析响应失败:', e.message);
        console.log('原始输出:', output);
        resolve({ success: false, error: e.message });
      }
    });

    child.on('error', (error) => {
      console.log('❌ 进程错误:', error.message);
      resolve({ success: false, error: error.message });
    });

    // 发送测试请求
    child.stdin.write(JSON.stringify(testCase.request) + '\n');
    child.stdin.end();
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始本地测试 Prompt Format MCP 服务器');
  console.log('=' .repeat(70));

  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({ name: testCase.name, ...result });
    
    // 在测试之间添加延迟，避免API调用过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 显示测试总结
  console.log('\n📊 测试总结');
  console.log('=' .repeat(50));
  
  let successCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.success) successCount++;
  });

  console.log(`\n总计: ${successCount}/${results.length} 测试通过`);
  
  if (successCount === results.length) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查错误信息');
  }
}

// 主函数
async function main() {
  try {
    await runAllTests();
  } catch (error) {
    console.error('测试运行失败:', error);
    process.exit(1);
  }
}

main(); 