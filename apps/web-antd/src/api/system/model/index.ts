import type { Model } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/model/export',
  configList = '/system/model/list',
  root = '/system/model',
}

export function modelList(params?: PageQuery) {
  return requestClient.get<PageResult<Model>>(Api.configList, { params });
}

export function modelInfo(configId: ID) {
  return requestClient.get<Model>(`${Api.root}/${configId}`);
}


export function modelUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function modelAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function modelRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}
