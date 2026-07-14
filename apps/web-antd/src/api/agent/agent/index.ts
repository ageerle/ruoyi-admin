import type { AgentVO, SkillOption } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  root = '/agent/agent',
  list = '/agent/agent/list',
  agentOptions = '/agent/agent/agentOptions',
  skillOptions = '/agent/agent/skillOptions',
  modelOptions = '/system/model/list',
  mcpToolOptions = '/mcp/tool/all',
  knowledgeOptions = '/system/info/list',
}

/**
 * 智能体分页列表
 */
export function agentList(params?: PageQuery) {
  return requestClient.get<PageResult<AgentVO>>(Api.list, { params });
}

/**
 * 智能体详情
 */
export function agentInfo(id: ID) {
  return requestClient.get<AgentVO>(`${Api.root}/${id}`);
}

/**
 * 新增智能体
 */
export function agentAdd(data: Partial<AgentVO>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 修改智能体
 */
export function agentUpdate(data: Partial<AgentVO>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除智能体
 */
export function agentRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出智能体
 */
export function agentExport(data: Partial<AgentVO>) {
  return commonExport(`${Api.root}/export`, data);
}

/**
 * 启用的智能体下拉选项（用户端聊天页用）
 */
export function agentEnabledOptions() {
  return requestClient.get<AgentVO[]>(Api.agentOptions);
}

/**
 * 磁盘 Skills 选项（表单勾选用）
 */
export function agentSkillOptions() {
  return requestClient.get<SkillOption[]>(Api.skillOptions);
}

/**
 * 聊天模型选项（category=chat）
 */
export function agentModelOptions() {
  return requestClient.get<{ rows: AgentVO[]; total: number }>(
    Api.modelOptions,
    { params: { category: 'chat', pageNum: 1, pageSize: 1000 } },
  );
}

/**
 * MCP 工具选项
 */
export function agentMcpToolOptions() {
  return requestClient.get<{ data: any[]; total: number }>(Api.mcpToolOptions);
}

/**
 * 知识库选项
 */
export function agentKnowledgeOptions() {
  return requestClient.get<{ rows: any[]; total: number }>(
    Api.knowledgeOptions,
    { params: { pageNum: 1, pageSize: 1000 } },
  );
}
