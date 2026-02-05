import type { FragmentVO, FragmentForm, FragmentQuery } from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
* 查询知识片段列表
* @param params
* @returns 知识片段列表
*/
export function fragmentList(params?: FragmentQuery) {
  return requestClient.get<PageResult<FragmentVO>>('/system/fragment/list', { params });
}

/**
 * 导出知识片段列表
 * @param params
 * @returns 知识片段列表
 */
export function fragmentExport(params?: FragmentQuery) {
  return commonExport('/system/fragment/export', params ?? {});
}

/**
 * 查询知识片段详情
 * @param id id
 * @returns 知识片段详情
 */
export function fragmentInfo(id: ID) {
  return requestClient.get<FragmentVO>(`/system/fragment/${id}`);
}

/**
 * 新增知识片段
 * @param data
 * @returns void
 */
export function fragmentAdd(data: FragmentForm) {
  return requestClient.postWithMsg<void>('/system/fragment', data);
}

/**
 * 更新知识片段
 * @param data
 * @returns void
 */
export function fragmentUpdate(data: FragmentForm) {
  return requestClient.putWithMsg<void>('/system/fragment', data);
}

/**
 * 删除知识片段
 * @param id id
 * @returns void
 */
export function fragmentRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/fragment/${id}`);
}
