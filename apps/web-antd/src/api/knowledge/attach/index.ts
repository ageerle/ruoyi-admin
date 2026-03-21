import type { AttachVO, AttachForm, AttachQuery } from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
* 查询知识库附件列表
* @param params
* @returns 知识库附件列表
*/
export function attachList(params?: AttachQuery) {
  return requestClient.get<PageResult<AttachVO>>('/system/attach/list', { params });
}

/**
 * 导出知识库附件列表
 * @param params
 * @returns 知识库附件列表
 */
export function attachExport(params?: AttachQuery) {
  return commonExport('/system/attach/export', params ?? {});
}

/**
 * 查询知识库附件详情
 * @param id id
 * @returns 知识库附件详情
 */
export function attachInfo(id: ID) {
  return requestClient.get<AttachVO>(`/system/attach/${id}`);
}

/**
 * 新增知识库附件
 * @param data
 * @returns void
 */
export function attachAdd(data: AttachForm) {
  return requestClient.postWithMsg<void>('/system/attach', data);
}

/**
 * 更新知识库附件
 * @param data
 * @returns void
 */
export function attachUpdate(data: AttachForm) {
  return requestClient.putWithMsg<void>('/system/attach', data);
}

/**
 * 删除知识库附件
 * @param id id
 * @returns void
 */
export function attachRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/attach/${id}`);
}
