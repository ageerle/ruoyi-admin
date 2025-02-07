import type { PackagePlan } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  dictDataExport = '/system/packagePlan/export',
  dictDataList = '/system/packagePlan/list',
  root = '/system/packagePlan',
}


/**
 * 套餐数据
 * @param params 查询参数
 * @returns 套餐数据列表
 */
export function packagePlanList(params?: PageQuery) {
  return requestClient.get<PackagePlan[]>(Api.dictDataList, { params });
}

/**
 * 导出套餐数据
 * @param data 表单参数
 * @returns blob
 */
export function packagePlanExport(data: any) {
  return commonExport(Api.dictDataExport, data);
}

/**
 * 删除
 * @param dictIds 套餐ID Array
 * @returns void
 */
export function packagePlanRemove(dictIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${dictIds.join(',')}`);
}

/**
 * 新增
 * @param data 表单参数
 * @returns void
 */
export function packagePlanAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 修改
 * @param data 表单参数
 * @returns void
 */
export function dictDataUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 查询套餐数据详细
 * @param dictCode 套餐编码
 * @returns 套餐数据
 */
export function packagePlanlInfo(dictCode: ID) {
  return requestClient.get<PackagePlan>(`${Api.root}/${dictCode}`);
}
