#!/usr/bin/env node

// 测试最新版本的 prompt-format-mcp
import { spawn } from 'child_process';

console.log('🚀 测试 prompt-format-mcp@1.0.2...');

// 设置环境变量
const env = {
  ...process.env,
  SILICONFLOW_API_KEY: 'sk-esvuhwigovazzljmtcmwgsmwcrgbrnrtzokaireqyytezgdh'
};

// 启动MCP服务器
const mcp = spawn('npx', ['-y', 'prompt-format-mcp@1.0.2', '--stdio'], {
  env,
  stdio: ['pipe', 'pipe', 'pipe']
});

// 测试工具列表
const testToolsList = () => {
  console.log('📋 测试工具列表...');
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }) + '\n';
  
  mcp.stdin.write(request);
};

// 测试连接检查
const testConnection = () => {
  console.log('🔍 测试连接检查...');
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "check-connection",
      arguments: { random_string: "test" }
    }
  }) + '\n';
  
  mcp.stdin.write(request);
};

let responseCount = 0;
let buffer = '';

mcp.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // 处理完整的JSON消息
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // 保留不完整的行
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        responseCount++;
        
        if (response.id === 1) {
          console.log('✅ 工具列表获取成功');
          console.log('可用工具:', response.result?.tools?.map(t => t.name).join(', '));
          
          // 测试连接
          setTimeout(testConnection, 1000);
        } else if (response.id === 2) {
          console.log('✅ 连接测试完成');
          console.log('结果:', response.result?.content?.[0]?.text || response.error?.message);
          
          // 结束测试
          mcp.kill();
          process.exit(0);
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
    }
  }
});

mcp.stderr.on('data', (data) => {
  console.log('📄 服务器日志:', data.toString());
});

mcp.on('close', (code) => {
  console.log(`🏁 测试完成，退出码: ${code}`);
});

// 开始测试
setTimeout(testToolsList, 2000);

// 超时处理
setTimeout(() => {
  console.log('⏰ 测试超时');
  mcp.kill();
  process.exit(1);
}, 30000); 