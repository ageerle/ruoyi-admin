import type { Tenant } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  dictSync = '/system/tenant/syncTenantDict',
  root = '/system/tenant',
  tenantDynamic = '/system/tenant/dynamic',
  tenantDynamicClear = '/system/tenant/dynamic/clear',
  tenantExport = '/system/tenant/export',
  tenantList = '/system/tenant/list',
  tenantStatus = '/system/tenant/changeStatus',
  tenantSyncPackage = '/system/tenant/syncTenantPackage',
}

export function tenantList(params?: PageQuery) {
  return requestClient.get<Tenant[]>(Api.tenantList, { params });
}

export function tenantExport(data: any) {
  return commonExport(Api.tenantExport, data);
}

export function tenantInfo(id: ID) {
  return requestClient.get<Tenant>(`${Api.root}/${id}`);
}

/**
 * 新增租户 必须开启加密
 * @param data data
 * @returns void
 */
export function tenantAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data, { encrypt: true });
}

export function tenantUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function tenantStatusChange(data: any) {
  return requestClient.putWithMsg(Api.tenantStatus, data);
}

export function tenantRemove(ids: IDS) {
  return requestClient.deleteWithMsg(`${Api.root}/${ids}`);
}

/**
 * 动态切换租户
 * @param tenantId 租户ID
 * @returns void
 */
export function tenantDynamicToggle(tenantId: string) {
  return requestClient.get<void>(`${Api.tenantDynamic}/${tenantId}`);
}

/**
 * 清除 动态切换租户
 * @returns void
 */
export function tenantDynamicClear() {
  return requestClient.get<void>(Api.tenantDynamicClear);
}

/**
 * 租户套餐同步
 * @param tenantId 租户id
 * @param packageId 套餐id
 * @param showMsg 是否显示成功信息
 * @returns void
 */
export function tenantSyncPackage(
  tenantId: string,
  packageId: string,
  showMsg = true,
) {
  return requestClient.get<void>(Api.tenantSyncPackage, {
    params: { packageId, tenantId },
    successMessageMode: showMsg ? 'message' : 'none',
  });
}

/**
 * 同步租户字典
 * @param tenantId 租户ID
 * @returns void
 */
export function dictSyncTenant(tenantId?: string) {
  return requestClient.get<void>(Api.dictSync, {
    params: { tenantId },
    successMessageMode: 'message',
  });
}
