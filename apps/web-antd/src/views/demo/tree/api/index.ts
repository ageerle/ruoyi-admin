import type { TreeForm, TreeQuery, TreeVO } from './model';

import type { ID, IDS } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * 查询测试树列表
 * @param params
 * @returns 测试树列表
 */
export function treeList(params?: TreeQuery) {
  return requestClient.get<TreeVO[]>('/demo/tree/list', { params });
}

/**
 * 查询测试树详情
 * @param id id
 * @returns 测试树详情
 */
export function treeInfo(id: ID) {
  return requestClient.get<TreeVO>(`/demo/tree/${id}`);
}

/**
 * 新增测试树
 * @param data
 * @returns void
 */
export function treeAdd(data: TreeForm) {
  return requestClient.postWithMsg<void>('/demo/tree', data);
}

/**
 * 更新测试树
 * @param data
 * @returns void
 */
export function treeUpdate(data: TreeForm) {
  return requestClient.putWithMsg<void>('/demo/tree', data);
}

/**
 * 删除测试树
 * @param id id
 * @returns void
 */
export function treeRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/demo/tree/${id}`);
}
