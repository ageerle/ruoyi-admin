import type { TenantPackage } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  packageChangeStatus = '/system/tenant/package/changeStatus',
  packageExport = '/system/tenant/package/export',
  packageList = '/system/tenant/package/list',
  packageSelectList = '/system/tenant/package/selectList',
  root = '/system/tenant/package',
}

export function packageList(params?: PageQuery) {
  return requestClient.get<PageResult<TenantPackage>>(Api.packageList, {
    params,
  });
}

// 下拉框
export function packageSelectList() {
  return requestClient.get<TenantPackage[]>(Api.packageSelectList);
}

export function packageExport(data: any) {
  return commonExport(Api.packageExport, data);
}

export function packageInfo(id: ID) {
  return requestClient.get<TenantPackage>(`${Api.root}/${id}`);
}

export function packageAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function packageUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function packageChangeStatus(data: any) {
  return requestClient.putWithMsg(Api.packageChangeStatus, data);
}

export function packageRemove(ids: IDS) {
  return requestClient.deleteWithMsg(`${Api.root}/${ids}`);
}
