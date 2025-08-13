import type {PluginForm, PluginQuery, PluginVO} from './model';

import type {ID, IDS, PageResult} from '#/api/common';

import {commonExport} from '#/api/helper';
import {requestClient} from '#/api/request';

/**
 * 查询插件管理列表
 * @param params
 * @returns 插件管理列表
 */
export function pluginList(params?: PluginQuery) {
  return requestClient.get<PageResult<PluginVO>>('/system/plugin/list', {
    params,
  });
}

/**
 * 导出插件管理列表
 * @param params
 * @returns 插件管理列表
 */
export function pluginExport(params?: PluginQuery) {
  return commonExport('/system/plugin/export', params ?? {});
}

/**
 * 查询插件管理详情
 * @param id id
 * @returns 插件管理详情
 */
export function pluginInfo(id: ID) {
  return requestClient.get<PluginVO>(`/system/plugin/${id}`);
}

/**
 * 新增插件管理
 * @param data
 * @returns void
 */
export function pluginAdd(data: PluginForm) {
  return requestClient.postWithMsg<void>('/system/plugin', data);
}

/**
 * 更新插件管理
 * @param data
 * @returns void
 */
export function pluginUpdate(data: PluginForm) {
  return requestClient.putWithMsg<void>('/system/plugin', data);
}

/**
 * 删除插件管理
 * @param id id
 * @returns void
 */
export function pluginRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/plugin/${id}`);
}
