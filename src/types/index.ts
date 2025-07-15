export interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  created: number;
  id: string;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface SiliconFlowRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export type FormatStyle = 'basic' | 'professional' | 'conversational' | 'technical';

export interface FormatOptions {
  style: FormatStyle;
  addExamples?: boolean;
  addConstraints?: boolean;
  preserveOriginal?: boolean;
} 