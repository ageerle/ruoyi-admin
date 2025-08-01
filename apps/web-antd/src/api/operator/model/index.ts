import type { ModelForm, ModelQuery, ModelVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询聊天模型列表
 * @param params
 * @returns 聊天模型列表
 */
export function modelList(params?: ModelQuery) {
  return requestClient.get<PageResult<ModelVO>>('/system/model/list', {
    params,
  });
}

/**
 * 导出聊天模型列表
 * @param params
 * @returns 聊天模型列表
 */
export function modelExport(params?: ModelQuery) {
  return commonExport('/system/model/export', params ?? {});
}

/**
 * 查询聊天模型详情
 * @param id id
 * @returns 聊天模型详情
 */
export function modelInfo(id: ID) {
  return requestClient.get<ModelVO>(`/system/model/${id}`);
}

/**
 * 新增聊天模型
 * @param data
 * @returns void
 */
export function modelAdd(data: ModelForm) {
  return requestClient.postWithMsg<void>('/system/model', data);
}

/**
 * 更新聊天模型
 * @param data
 * @returns void
 */
export function modelUpdate(data: ModelForm) {
  return requestClient.putWithMsg<void>('/system/model', data);
}

/**
 * 删除聊天模型
 * @param id id
 * @returns void
 */
export function modelRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/model/${id}`);
}
