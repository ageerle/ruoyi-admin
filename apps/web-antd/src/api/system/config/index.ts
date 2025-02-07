import type { Config } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/config/export',
  configInfoByKey = '/system/config/configKey',
  configList = '/system/config/list',
  configRefreshCache = '/system/config/refreshCache',
  root = '/system/config',
}

export function configList(params?: PageQuery) {
  return requestClient.get<PageResult<Config>>(Api.configList, { params });
}

export function configInfo(configId: ID) {
  return requestClient.get<Config>(`${Api.root}/${configId}`);
}

export function configExport(data: any) {
  return commonExport(Api.configExport, data);
}

/**
 * 刷新缓存
 * @returns void
 */
export function configRefreshCache() {
  return requestClient.deleteWithMsg<void>(Api.configRefreshCache);
}

export function configUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function configAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function configRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}

/**
 * 获取配置信息
 * @param configKey configKey
 * @returns value
 */
export function configInfoByKey(configKey: string) {
  return requestClient.get<string>(`${Api.configInfoByKey}/${configKey}`);
}
