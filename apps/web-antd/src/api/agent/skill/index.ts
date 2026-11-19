import type { ID, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

export type SkillStatus = '0' | '1';

export interface AgentSkill {
  description: string;
  id: ID;
  name: string;
  status: SkillStatus;
  updateTime?: string;
}

export interface AgentSkillForm {
  content: string;
  description: string;
  id?: ID;
  name: string;
  status: SkillStatus;
}

const path = '/agent/skill';

export function agentSkillList(
  params: PageQuery & { name?: string; status?: SkillStatus },
) {
  return requestClient.get<PageResult<AgentSkill>>(path + '/list', { params });
}

export function agentSkillInfo(id: ID) {
  return requestClient.get<AgentSkillForm>(path + '/' + id);
}

export function agentSkillAdd(data: AgentSkillForm) {
  return requestClient.postWithMsg<void>(path, data);
}

export function agentSkillUpdate(data: AgentSkillForm) {
  return requestClient.putWithMsg<void>(path, data);
}

export function agentSkillRemove(id: ID) {
  return requestClient.deleteWithMsg<void>(path + '/' + id);
}
