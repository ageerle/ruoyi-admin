export interface AgentVO {
  id: number;
  agentName: string;
  agentDescribe?: string;
  agentShow?: string;
  modelId: number;
  modelName?: string;
  enableThinking?: string;
  systemPrompt?: string;
  mcpToolIds?: number[];
  mcpToolNames?: string[];
  skillNames?: string[];
  knowledgeIds?: number[];
  knowledgeNames?: string[];
  status: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface SkillOption {
  name: string;
  description?: string;
}
