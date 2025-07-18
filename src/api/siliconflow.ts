// 🌐 导入HTTP客户端和类型定义
import axios, { AxiosResponse } from 'axios';                    // HTTP客户端库
import { SiliconFlowRequest, SiliconFlowResponse } from '../types/index.js';  // 自定义类型定义

/**
 * 🤖 SiliconFlow API客户端类
 * 这个类封装了与SiliconFlow AI服务的所有交互
 * 主要功能：
 * 1. 管理API连接和认证
 * 2. 发送HTTP请求到AI服务
 * 3. 处理响应和错误
 * 4. 实现重试机制
 */
export class SiliconFlowClient {
  private apiKey: string;     // API密钥，用于身份验证
  private baseUrl: string;    // API基础URL
  private modelName: string;  // 使用的AI模型名称

  /**
   * 🏗️ 构造函数
   * 初始化API客户端的基本配置
   * @param apiKey API密钥
   * @param baseUrl 可选的API基础URL
   * @param modelName 可选的模型名称
   */
  constructor(apiKey: string, baseUrl?: string, modelName?: string) {
    this.apiKey = apiKey;
    // 如果没有提供baseUrl，使用默认的SiliconFlow API地址
    this.baseUrl = baseUrl || 'https://api.siliconflow.cn/v1';
    // 如果没有提供模型名称，使用默认的Qwen模型
    this.modelName = modelName || 'Qwen/QwQ-32B';
  }

  /**
   * 🔄 调用SiliconFlow API的私有方法
   * 这是所有API调用的核心方法，包含完整的错误处理和重试逻辑
   * @param request API请求对象
   * @returns Promise<SiliconFlowResponse> API响应
   */
  private async callAPI(request: SiliconFlowRequest): Promise<SiliconFlowResponse> {
    const maxRetries = 3;        // 最大重试次数
    let lastError: Error | null = null;  // 保存最后一次错误

    // 🔁 重试循环
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 🌐 发送HTTP POST请求到AI API
        const response: AxiosResponse<SiliconFlowResponse> = await axios.post(
          `${this.baseUrl}/chat/completions`,  // 聊天完成接口
          request,                             // 请求体
          {
            headers: {
              // 🔐 Bearer Token认证
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 90000,                    // 90秒超时
            // 🛡️ 自定义状态码验证
            // 只有5xx状态码才被视为需要重试的错误
            validateStatus: (status) => status < 500
          }
        );

        // ✅ 请求成功，返回响应数据
        return response.data;
      } catch (error: any) {
        // 📝 保存错误信息
        lastError = error;
        
        // 🔍 分析错误类型并决定是否重试
        
        // 🕐 超时错误处理
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          if (attempt < maxRetries) {
            // 等待递增的延迟时间后重试
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;  // 继续下一次尝试
          }
          // 所有重试都失败了，抛出超时错误
          throw new Error(`网络请求超时: 已尝试 ${maxRetries} 次，请检查网络连接`);
        } 
        // 🚨 服务器错误处理（5xx状态码）
        else if (error.response && error.response.status >= 500) {
          if (attempt < maxRetries) {
            // 等待递增的延迟时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;  // 继续下一次尝试
          }
          // 构造详细的服务器错误信息
          throw new Error(`服务器错误: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } 
        // 🔒 客户端错误处理（4xx状态码）
        else if (error.response) {
          // 4xx错误通常不需要重试（如认证失败、参数错误等）
          throw new Error(`API调用失败: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
        } 
        // 🌐 网络连接错误
        else if (error.request) {
          if (attempt < maxRetries) {
            // 等待递增的延迟时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;  // 继续下一次尝试
          }
          // 网络连接失败
          throw new Error(`网络请求失败: ${error.message}`);
        } 
        // ⚙️ 请求配置错误
        else {
          // 配置错误不需要重试
          throw new Error(`请求配置错误: ${error.message}`);
        }
      }
    }

    // 如果所有重试都失败了，抛出最后一次的错误
    throw lastError || new Error('API调用失败');
  }

  /**
   * 🎯 优化提示词的公共方法
   * 这是客户端的主要功能，使用AI模型优化用户的提示词
   * @param content 用户原始的提示词内容
   * @returns Promise<string> 优化后的提示词
   */
  async optimizePrompt(content: string): Promise<string> {
    // 📝 构造优化提示词的系统提示
    // 这个提示告诉AI如何优化用户的提示词
    const prompt = `请优化以下提示词，使其更清晰、准确、易于AI理解。要求：

1. 保持原始意图不变
2. 提高指令清晰度
3. 添加必要的上下文
4. 使用结构化表达
5. 确保可执行性

请直接输出优化后的提示词，不要添加额外说明。

原始提示词：
${content}`;
    
    // 🔧 构造API请求对象
    const request: SiliconFlowRequest = {
      model: this.modelName,              // 使用的AI模型
      messages: [
        { role: 'user', content: prompt }  // 用户消息
      ],
      temperature: 0.3,                   // 较低的温度值，减少随机性
      max_tokens: 4000                    // 最大生成token数
    };

    // 🚀 调用API并获取响应
    const response = await this.callAPI(request);
    
    // 🔍 验证响应格式
    if (!response.choices || response.choices.length === 0) {
      throw new Error('API返回的响应格式不正确');
    }

    // 📤 返回优化后的提示词
    // 去除首尾空白字符
    return response.choices[0].message.content.trim();
  }
} 