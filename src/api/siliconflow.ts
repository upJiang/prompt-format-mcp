import axios, { AxiosResponse } from 'axios';
import { SiliconFlowRequest, SiliconFlowResponse, FormatStyle } from '../types/index.js';
import { SYSTEM_PROMPTS, OPTIMIZATION_PROMPT, ANALYSIS_PROMPT } from '../formatters/prompts.js';

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
            timeout: 90000, // 增加到90秒超时
            validateStatus: (status) => status < 500 // 只有5xx错误才重试
          }
        );

        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // 记录尝试信息
        console.log(`[INFO] API调用尝试 ${attempt}/${maxRetries} 失败`);
        
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.log(`[INFO] 超时错误，${attempt < maxRetries ? '重试中...' : '已达到最大重试次数'}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // 递增延迟
            continue;
          }
          throw new Error(`网络请求超时: 已尝试 ${maxRetries} 次，请检查网络连接`);
        } else if (error.response && error.response.status >= 500) {
          console.log(`[INFO] 服务器错误 ${error.response.status}，${attempt < maxRetries ? '重试中...' : '已达到最大重试次数'}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`服务器错误: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } else if (error.response) {
          // 4xx错误不重试
          throw new Error(`API调用失败: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } else if (error.request) {
          console.log(`[INFO] 网络请求错误，${attempt < maxRetries ? '重试中...' : '已达到最大重试次数'}`);
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
   * 格式化提示词
   */
  async formatPrompt(content: string, style: FormatStyle = 'basic'): Promise<string> {
    const systemPrompt = SYSTEM_PROMPTS[style];
    
    const request: SiliconFlowRequest = {
      model: this.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
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

  /**
   * 优化提示词
   */
  async optimizePrompt(content: string): Promise<string> {
    const prompt = OPTIMIZATION_PROMPT.replace('{content}', content);
    
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

  /**
   * 分析提示词质量
   */
  async analyzePrompt(content: string): Promise<string> {
    const prompt = ANALYSIS_PROMPT.replace('{content}', content);
    
    const request: SiliconFlowRequest = {
      model: this.modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };

    const response = await this.callAPI(request);
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('API返回的响应格式不正确');
    }

    return response.choices[0].message.content.trim();
  }

  /**
   * 检查API连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      const request: SiliconFlowRequest = {
        model: this.modelName,
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      };

      await this.callAPI(request);
      return true;
    } catch (error) {
      return false;
    }
  }
} 