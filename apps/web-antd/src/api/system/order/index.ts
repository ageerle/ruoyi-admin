import type { Order } from './order';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system//orders/export',
  configList = '/system//orders/list',
  root = '/system/orders',
}

export function orderList(params?: PageQuery) {
  return requestClient.get<PageResult<Order>>(Api.configList, { params });
}

export function orderInfo(configId: ID) {
  return requestClient.get<Order>(`${Api.root}/${configId}`);
}


export function orderUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function orderAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function orderRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}
