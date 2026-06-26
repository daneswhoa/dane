// ── Sophia Agent Types ──

export type AgentBlockType =
  | 'text'
  | 'error'
  | 'data_table'
  | 'confirmation'
  | 'form'
  | 'step_guide'
  | 'file_upload'
  | 'image_upload';

export interface AgentTextBlock {
  type: 'text';
  content: string;
}

export interface AgentErrorBlock {
  type: 'error';
  message: string;
  suggestion?: string;
}

export interface AgentDataTableBlock {
  type: 'data_table';
  title?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
}

export interface AgentConfirmationBlock {
  type: 'confirmation';
  title: string;
  summary: Record<string, unknown>;
  confirmAction: string;
  cancelAction?: string;
}

export interface AgentFormField {
  name: string;
  label: string;
  fieldType: 'text' | 'number' | 'email' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface AgentFormBlock {
  type: 'form';
  fields: AgentFormField[];
  submitLabel: string;
  onSubmitAction: string;
}

export interface AgentStepGuideBlock {
  type: 'step_guide';
  steps: Array<{
    title: string;
    status: 'pending' | 'running' | 'done' | 'error';
  }>;
}

export interface AgentFileUploadBlock {
  type: 'file_upload';
  accept?: string;
  label: string;
  onUploadAction: string;
}

export interface AgentImageUploadBlock {
  type: 'image_upload';
  label: string;
  description?: string;
  onUploadAction: string;
}

export type AgentResponseBlock =
  | AgentTextBlock
  | AgentErrorBlock
  | AgentDataTableBlock
  | AgentConfirmationBlock
  | AgentFormBlock
  | AgentStepGuideBlock
  | AgentFileUploadBlock
  | AgentImageUploadBlock;

export interface AgentRunResponse {
  blocks: AgentResponseBlock[];
}

// ── Tool Definitions ──

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: string;
  requiresConfirmation: boolean;
  enabled: boolean;
}
