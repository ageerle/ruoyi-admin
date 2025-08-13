import type {GptsForm, GptsQuery, GptsVO} from './model';

import type {ID, IDS, PageResult} from '#/api/common';

import {commonExport} from '#/api/helper';
import {requestClient} from '#/api/request';

/**
 * 查询应用管理列表
 * @param params
 * @returns 应用管理列表
 */
export function gptsList(params?: GptsQuery) {
  return requestClient.get<PageResult<GptsVO>>('/system/gpts/list', {params});
}

/**
 * 导出应用管理列表
 * @param params
 * @returns 应用管理列表
 */
export function gptsExport(params?: GptsQuery) {
  return commonExport('/system/gpts/export', params ?? {});
}

/**
 * 查询应用管理详情
 * @param id id
 * @returns 应用管理详情
 */
export function gptsInfo(id: ID) {
  return requestClient.get<GptsVO>(`/system/gpts/${id}`);
}

/**
 * 新增应用管理
 * @param data
 * @returns void
 */
export function gptsAdd(data: GptsForm) {
  return requestClient.postWithMsg<void>('/system/gpts', data);
}

/**
 * 更新应用管理
 * @param data
 * @returns void
 */
export function gptsUpdate(data: GptsForm) {
  return requestClient.putWithMsg<void>('/system/gpts', data);
}

/**
 * 删除应用管理
 * @param id id
 * @returns void
 */
export function gptsRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/gpts/${id}`);
}
