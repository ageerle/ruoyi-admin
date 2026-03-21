import type { ProviderForm, ProviderQuery, ProviderVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询厂商管理列表
 * @param params
 * @returns 厂商管理列表
 */
export function providerList(params?: ProviderQuery) {
  return requestClient.get<PageResult<ProviderVO>>('/system/provider/list', {
    params,
  });
}

/**
 * 导出厂商管理列表
 * @param params
 * @returns 厂商管理列表
 */
export function providerExport(params?: ProviderQuery) {
  return commonExport('/system/provider/export', params ?? {});
}

/**
 * 查询厂商管理详情
 * @param id id
 * @returns 厂商管理详情
 */
export function providerInfo(id: ID) {
  return requestClient.get<ProviderVO>(`/system/provider/${id}`);
}

/**
 * 新增厂商管理
 * @param data
 * @returns void
 */
export function providerAdd(data: ProviderForm) {
  return requestClient.postWithMsg<void>('/system/provider', data);
}

/**
 * 更新厂商管理
 * @param data
 * @returns void
 */
export function providerUpdate(data: ProviderForm) {
  return requestClient.putWithMsg<void>('/system/provider', data);
}

/**
 * 删除厂商管理
 * @param id id
 * @returns void
 */
export function providerRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/provider/${id}`);
}
