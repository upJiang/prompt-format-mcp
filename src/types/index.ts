// 📝 SiliconFlow API相关类型定义
// 这些类型定义确保了与SiliconFlow AI服务交互时的类型安全

/**
 * 🤖 SiliconFlow API响应类型
 * 这个接口定义了从SiliconFlow API收到的响应数据结构
 * 符合OpenAI兼容的聊天完成API响应格式
 */
export interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;    // AI生成的文本内容
      role: string;       // 消息角色（通常是"assistant"）
    };
    finish_reason: string; // 生成结束的原因（如"stop"、"length"等）
    index: number;        // 选择的索引（通常是0）
  }>;
  created: number;        // 响应创建的时间戳
  id: string;            // 响应的唯一标识符
  model: string;         // 使用的模型名称
  object: string;        // 对象类型（通常是"chat.completion"）
  usage: {
    completion_tokens: number;  // 生成的token数量
    prompt_tokens: number;      // 输入的token数量
    total_tokens: number;       // 总token数量
  };
}

/**
 * 🔧 SiliconFlow API请求类型
 * 这个接口定义了发送给SiliconFlow API的请求数据结构
 * 符合OpenAI兼容的聊天完成API请求格式
 */
export interface SiliconFlowRequest {
  model: string;                   // 要使用的AI模型名称
  messages: Array<{
    role: 'system' | 'user' | 'assistant';  // 消息角色
    content: string;               // 消息内容
  }>;
  max_tokens?: number;             // 可选：最大生成token数
  temperature?: number;            // 可选：生成的随机性（0-1）
  stream?: boolean;                // 可选：是否流式输出
}