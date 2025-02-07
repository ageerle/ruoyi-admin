import type { Voucher } from './exchange';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/voucher/export',
  configList = '/system/voucher/list',
  root = '/system/voucher',
}

export function voucherList(params?: PageQuery) {
  return requestClient.get<PageResult<Voucher>>(Api.configList, { params });
}

export function voucherInfo(configId: ID) {
  return requestClient.get<Voucher>(`${Api.root}/${configId}`);
}


export function voucherUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function voucherAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function voucherRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}
