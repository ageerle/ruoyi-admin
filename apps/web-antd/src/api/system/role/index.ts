import type { DeptResp, Role } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  roleAllocatedList = '/system/role/authUser/allocatedList',
  roleAuthCancel = '/system/role/authUser/cancel',
  roleAuthCancelAll = '/system/role/authUser/cancelAll',
  roleAuthSelectAll = '/system/role/authUser/selectAll',
  roleChangeStatus = '/system/role/changeStatus',
  roleDataScope = '/system/role/dataScope',
  roleDeptTree = '/system/role/deptTree',
  roleExport = '/system/role/export',
  roleList = '/system/role/list',
  roleOptionSelect = '/system/role/optionselect',
  roleUnallocatedList = '/system/role/authUser/unallocatedList',
  root = '/system/role',
}

export function roleList(params?: PageQuery) {
  return requestClient.get<Role[]>(Api.roleList, { params });
}

export function roleExport(data: any) {
  return commonExport(Api.roleExport, data);
}

export function roleInfo(roleId: ID) {
  return requestClient.get<Role>(`${Api.root}/${roleId}`);
}

export function roleAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function roleUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function roleChangeStatus(data: any) {
  return requestClient.putWithMsg<void>(Api.roleChangeStatus, data);
}

export function roleRemove(roleIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${roleIds}`);
}

/**
 * 更新数据权限
 * @param data
 * @returns void
 */
export function roleDataScope(data: any) {
  return requestClient.putWithMsg<void>(Api.roleDataScope, data);
}

export function roleOptionSelect(params?: any) {
  return requestClient.get(Api.roleOptionSelect, { params });
}

export function roleAllocatedList(params: any) {
  return requestClient.get(Api.roleAllocatedList, params);
}

/**
 * 未授权的用户
 * @param params
 * @returns void
 */
export function roleUnallocatedList(params: any) {
  return requestClient.get(Api.roleUnallocatedList, { params });
}

/**
 * 取消授权
 * @param data {userId: 2, roleId: "2"}
 * @returns void
 */
export function roleAuthCancel(data: any) {
  return requestClient.putWithMsg<void>(Api.roleAuthCancel, data);
}

/**
 * 批量取消授权
 * @param roleId
 * @param userIds
 * @returns void
 */
export function roleAuthCancelAll(
  roleId: number | string,
  userIds: number[] | string[],
) {
  return requestClient.putWithMsg<void>(
    `${Api.roleAuthCancelAll}?roleId=${roleId}&userIds=${userIds.join(',')}`,
  );
}

/**
 * 批量授权用户
 * @param roleId
 * @param userIds
 * @returns void
 */
export function roleSelectAll(
  roleId: number | string,
  userIds: number[] | string[],
) {
  return requestClient.putWithMsg<void>(
    `${Api.roleAuthSelectAll}?roleId=${roleId}&userIds=${userIds.join(',')}`,
  );
}

/**
 * 部门树
 * @param roleId 角色id
 * @returns DeptResp
 */
export function roleDeptTree(roleId: ID) {
  return requestClient.get<DeptResp>(`${Api.roleDeptTree}/${roleId}`);
}
