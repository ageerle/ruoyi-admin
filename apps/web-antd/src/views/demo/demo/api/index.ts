import type { DemoForm, DemoQuery, DemoVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询测试单表列表
 * @param params
 * @returns 测试单表列表
 */
export function demoList(params?: DemoQuery) {
  return requestClient.get<PageResult<DemoVO>>('/demo/demo/list', { params });
}

/**
 * 导出测试单表列表
 * @param params
 * @returns 测试单表列表
 */
export function demoExport(params?: DemoQuery) {
  return commonExport('/demo/demo/export', params ?? {});
}

/**
 * 查询测试单表详情
 * @param id id
 * @returns 测试单表详情
 */
export function demoInfo(id: ID) {
  return requestClient.get<DemoVO>(`/demo/demo/${id}`);
}

/**
 * 新增测试单表
 * @param data
 * @returns void
 */
export function demoAdd(data: DemoForm) {
  return requestClient.postWithMsg<void>('/demo/demo', data);
}

/**
 * 更新测试单表
 * @param data
 * @returns void
 */
export function demoUpdate(data: DemoForm) {
  return requestClient.putWithMsg<void>('/demo/demo', data);
}

/**
 * 删除测试单表
 * @param id id
 * @returns void
 */
export function demoRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/demo/demo/${id}`);
}
