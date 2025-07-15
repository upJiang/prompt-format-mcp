#!/usr/bin/env node

// 模拟MCP环境变量
process.env.SILICONFLOW_API_KEY = 'sk-esvuhwigovazzljmtcmwgsmwcrgbrnrtzokaireqyytezgdh';

import { SiliconFlowClient } from './dist/api/siliconflow.js';

async function testConnection() {
  console.log('🔍 测试API连接...');
  console.log('API Key:', process.env.SILICONFLOW_API_KEY ? '已设置' : '未设置');
  console.log('API Key长度:', process.env.SILICONFLOW_API_KEY ? process.env.SILICONFLOW_API_KEY.length : 0);
  
  try {
    const client = new SiliconFlowClient(process.env.SILICONFLOW_API_KEY);
    
    console.log('\n📝 测试格式化功能...');
    const result = await client.formatPrompt('这是一个测试提示词', 'basic');
    console.log('✅ 格式化成功');
    console.log('结果长度:', result.length);
    console.log('结果预览:', result.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    // 详细错误信息
    if (error.message.includes('timeout')) {
      console.error('💡 建议: 网络连接可能较慢，请检查网络状态');
    } else if (error.message.includes('401')) {
      console.error('💡 建议: API Key可能无效，请检查API Key');
    } else if (error.message.includes('429')) {
      console.error('💡 建议: API调用频率过高，请稍后重试');
    }
  }
}

testConnection(); 