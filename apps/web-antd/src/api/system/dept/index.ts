import type { Dept } from './model';

import type { ID, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  deptList = '/system/dept/list',
  deptNodeInfo = '/system/dept/list/exclude',
  root = '/system/dept',
}

export function deptList(params?: PageQuery) {
  return requestClient.get<Dept[]>(Api.deptList, { params });
}

/**
 * 查询部门列表（排除节点）
 * @param deptId 部门ID
 * @returns void
 */
export function deptNodeList(deptId: ID) {
  return requestClient.get<Dept[]>(`${Api.deptNodeInfo}/${deptId}`);
}

export function deptInfo(deptId: ID) {
  return requestClient.get<Dept>(`${Api.root}/${deptId}`);
}

export function deptAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function deptUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 注意这里只允许单删除
 * @param deptId ID
 * @returns void
 */
export function deptRemove(deptId: ID) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${deptId}`);
}
