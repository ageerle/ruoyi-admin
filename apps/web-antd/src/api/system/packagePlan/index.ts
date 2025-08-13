import type {PackagePlanForm, PackagePlanQuery, PackagePlanVO} from './model';

import type {ID, IDS, PageResult} from '#/api/common';

import {commonExport} from '#/api/helper';
import {requestClient} from '#/api/request';

/**
 * 查询套餐管理列表
 * @param params
 * @returns 套餐管理列表
 */
export function packagePlanList(params?: PackagePlanQuery) {
  return requestClient.get<PageResult<PackagePlanVO>>(
    '/system/packagePlan/list',
    {params},
  );
}

/**
 * 导出套餐管理列表
 * @param params
 * @returns 套餐管理列表
 */
export function packagePlanExport(params?: PackagePlanQuery) {
  return commonExport('/system/packagePlan/export', params ?? {});
}

/**
 * 查询套餐管理详情
 * @param id id
 * @returns 套餐管理详情
 */
export function packagePlanInfo(id: ID) {
  return requestClient.get<PackagePlanVO>(`/system/packagePlan/${id}`);
}

/**
 * 新增套餐管理
 * @param data
 * @returns void
 */
export function packagePlanAdd(data: PackagePlanForm) {
  return requestClient.postWithMsg<void>('/system/packagePlan', data);
}

/**
 * 更新套餐管理
 * @param data
 * @returns void
 */
export function packagePlanUpdate(data: PackagePlanForm) {
  return requestClient.putWithMsg<void>('/system/packagePlan', data);
}

/**
 * 删除套餐管理
 * @param id id
 * @returns void
 */
export function packagePlanRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/packagePlan/${id}`);
}
