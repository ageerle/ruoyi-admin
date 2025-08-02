import type { KnowledgeRoleGroup } from './knowledge-role-group-model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  knowledgeRoleGroupList = '/knowledgeRoleGroup/list',
  root = '/knowledgeRoleGroup',
}

/**
 * 获取知识库角色列表
 * @param params 请求参数
 * @returns list
 */
export function knowledgeRoleGroupList(params?: PageQuery) {
  return requestClient.get<PageResult<KnowledgeRoleGroup>>(Api.knowledgeRoleGroupList, { params });
}

/**
 * 删除知识库角色
 * @param dictIds 知识库角色id数组
 * @returns void
 */
export function knowledgeRoleGroupRemove(dictIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${dictIds}`);
}

/**
 * 新增
 * @param data 表单参数
 * @returns void
 */
export function knowledgeRoleGroupAdd(data: Partial<KnowledgeRoleGroup>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 修改
 * @param data 表单参数
 * @returns void
 */
export function knowledgeRoleGroupUpdate(data: Partial<KnowledgeRoleGroup>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 查询详情
 * @param dictId 知识库角色id
 * @returns 信息
 */
export function knowledgeRoleGroupInfo(dictId: ID) {
  return requestClient.get<KnowledgeRoleGroup>(`${Api.root}/${dictId}`);
}
