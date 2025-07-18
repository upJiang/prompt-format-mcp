import axios, { AxiosResponse } from 'axios';
import { SiliconFlowRequest, SiliconFlowResponse } from '../types/index.js';

export class SiliconFlowClient {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor(apiKey: string, baseUrl?: string, modelName?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://api.siliconflow.cn/v1';
    this.modelName = modelName || 'Qwen/QwQ-32B';
  }

  /**
   * 调用 SiliconFlow API
   */
  private async callAPI(request: SiliconFlowRequest): Promise<SiliconFlowResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response: AxiosResponse<SiliconFlowResponse> = await axios.post(
          `${this.baseUrl}/chat/completions`,
          request,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 90000,
            validateStatus: (status) => status < 500
          }
        );

        return response.data;
      } catch (error: any) {
        lastError = error;
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          throw new Error(`网络请求超时: 已尝试 ${maxRetries} 次，请检查网络连接`);
        } else if (error.response && error.response.status >= 500) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`服务器错误: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } else if (error.response) {
          throw new Error(`API调用失败: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } else if (error.request) {
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`网络请求失败: ${error.message}`);
        } else {
          throw new Error(`请求配置错误: ${error.message}`);
        }
      }
    }

    throw lastError || new Error('API调用失败');
  }

  /**
   * 优化提示词
   */
  async optimizePrompt(content: string): Promise<string> {
    const prompt = `请优化以下提示词，使其更清晰、准确、易于AI理解。要求：

1. 保持原始意图不变
2. 提高指令清晰度
3. 添加必要的上下文
4. 使用结构化表达
5. 确保可执行性

请直接输出优化后的提示词，不要添加额外说明。

原始提示词：
${content}`;
    
    const request: SiliconFlowRequest = {
      model: this.modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    };

    const response = await this.callAPI(request);
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('API返回的响应格式不正确');
    }

    return response.choices[0].message.content.trim();
  }
} 