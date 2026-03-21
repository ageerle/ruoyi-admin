import type { ConfigForm, ConfigQuery, ConfigVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询配置信息列表
 * @param params
 * @returns 配置信息列表
 */
export function configList(params?: ConfigQuery) {
  return requestClient.get<PageResult<ConfigVO>>('/system/config/list', {
    params,
  });
}

/**
 * 导出配置信息列表
 * @param params
 * @returns 配置信息列表
 */
export function configExport(params?: ConfigQuery) {
  return commonExport('/system/config/export', params ?? {});
}

/**
 * 查询配置信息详情
 * @param id id
 * @returns 配置信息详情
 */
export function configInfo(id: ID) {
  return requestClient.get<ConfigVO>(`/system/config/${id}`);
}

/**
 * 新增配置信息
 * @param data
 * @returns void
 */
export function configAdd(data: ConfigForm) {
  return requestClient.postWithMsg<void>('/system/config', data);
}

/**
 * 更新配置信息
 * @param data
 * @returns void
 */
export function configUpdate(data: ConfigForm) {
  return requestClient.putWithMsg<void>('/system/config', data);
}

/**
 * 删除配置信息
 * @param id id
 * @returns void
 */
export function configRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/config/${id}`);
}
