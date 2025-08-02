import type { KnowledgeRole } from './knowledge-role-model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  knowledgeRoleList = '/knowledgeRole/list',
  root = '/knowledgeRole',
}

/**
 * 获取知识库角色列表
 * @param params 请求参数
 * @returns list
 */
export function knowledgeRoleList(params?: PageQuery) {
  return requestClient.get<PageResult<KnowledgeRole>>(Api.knowledgeRoleList, { params });
}

/**
 * 删除知识库角色
 * @param dictIds 知识库角色id数组
 * @returns void
 */
export function knowledgeRoleRemove(dictIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${dictIds}`);
}

/**
 * 新增
 * @param data 表单参数
 * @returns void
 */
export function knowledgeRoleAdd(data: Partial<KnowledgeRole>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 修改
 * @param data 表单参数
 * @returns void
 */
export function knowledgeRoleUpdate(data: Partial<KnowledgeRole>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 查询详情
 * @param dictId 知识库角色id
 * @returns 信息
 */
export function knowledgeRoleInfo(dictId: ID) {
  return requestClient.get<KnowledgeRole>(`${Api.root}/${dictId}`);
}
