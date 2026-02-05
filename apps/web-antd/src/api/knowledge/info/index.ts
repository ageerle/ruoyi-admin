import type { InfoVO, InfoForm, InfoQuery } from './model';

import type { ID, IDS } from '#/api/common';
import type { PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
* 查询知识库列表
* @param params
* @returns 知识库列表
*/
export function infoList(params?: InfoQuery) {
  return requestClient.get<PageResult<InfoVO>>('/system/info/list', { params });
}

/**
 * 导出知识库列表
 * @param params
 * @returns 知识库列表
 */
export function infoExport(params?: InfoQuery) {
  return commonExport('/system/info/export', params ?? {});
}

/**
 * 查询知识库详情
 * @param id id
 * @returns 知识库详情
 */
export function infoInfo(id: ID) {
  return requestClient.get<InfoVO>(`/system/info/${id}`);
}

/**
 * 新增知识库
 * @param data
 * @returns void
 */
export function infoAdd(data: InfoForm) {
  return requestClient.postWithMsg<void>('/system/info', data);
}

/**
 * 更新知识库
 * @param data
 * @returns void
 */
export function infoUpdate(data: InfoForm) {
  return requestClient.putWithMsg<void>('/system/info', data);
}

/**
 * 删除知识库
 * @param id id
 * @returns void
 */
export function infoRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/info/${id}`);
}
