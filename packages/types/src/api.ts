// ── API Request / Response Shapes ──

import type { AgentResponseBlock } from './agent';

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'landlord' | 'manager' | 'tenant' | 'contractor';
}

// Agent
export interface AgentChatRequest {
  message: string;
  chatHistory?: Array<{
    role: 'user' | 'agent';
    content: string;
    blocks?: AgentResponseBlock[];
  }>;
}

export interface AgentChatResponse {
  blocks: AgentResponseBlock[];
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
