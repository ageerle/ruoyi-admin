import type { Menu, MenuOption, MenuResp } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  menuList = '/system/menu/list',
  menuTreeSelect = '/system/menu/treeselect',
  roleMenuTree = '/system/menu/roleMenuTreeselect',
  root = '/system/menu',
  tenantPackageMenuTreeselect = '/system/menu/tenantPackageMenuTreeselect',
}

export function menuList(params?: PageQuery) {
  return requestClient.get<Menu[]>(Api.menuList, { params });
}

export function menuInfo(menuId: ID) {
  return requestClient.get<Menu>(`${Api.root}/${menuId}`);
}

export function menuAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function menuUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function menuRemove(menuIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${menuIds}`);
}

/**
 * 返回对应角色的菜单
 * @param roleId id
 * @returns resp
 */
export function roleMenuTreeSelect(roleId: ID) {
  return requestClient.get<MenuResp>(`${Api.roleMenuTree}/${roleId}`);
}

/**
 * 下拉框使用  返回所有的菜单
 * @returns []
 */
export function menuTreeSelect() {
  return requestClient.get<MenuOption[]>(Api.menuTreeSelect);
}

/**
 * 租户套餐使用
 * @param packageId packageId
 * @returns resp
 */
export function tenantPackageMenuTreeSelect(packageId: ID) {
  return requestClient.get<MenuResp>(
    `${Api.tenantPackageMenuTreeselect}/${packageId}`,
  );
}
