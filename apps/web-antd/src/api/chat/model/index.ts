import type {
  ModelForm,
  ModelQuery,
  ModelVO,
  VisionDefaultSettings,
} from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

const visionDefaultUrl = '/system/model/visionDefault';

export function getVisionDefault(signal?: AbortSignal) {
  return requestClient.get<VisionDefaultSettings>(visionDefaultUrl, {
    errorMessageMode: 'none',
    signal,
  });
}

export function updateVisionDefault(modelName: string) {
  return requestClient.putWithMsg<void>(
    visionDefaultUrl,
    { modelName },
    { errorMessageMode: 'none' },
  );
}

/**
 * 查询模型管理列表
 * @param params
 * @returns 模型管理列表
 */
export function modelList(params?: ModelQuery) {
  return requestClient.get<PageResult<ModelVO>>('/system/model/list', {
    params,
  });
}

/**
 * 查询向量模型列表
 * @returns 向量模型列表
 */
export function embeddingModelList() {
  return modelList({ category: 'vector', pageSize: 1000 });
}

/**
 * 查询重排序模型列表
 * @returns 重排序模型列表
 */
export function rerankModelList() {
  return modelList({ category: 'rerank', pageSize: 1000 });
}

/**
 * 导出模型管理列表
 * @param params
 * @returns 模型管理列表
 */
export function modelExport(params?: ModelQuery) {
  return commonExport('/system/model/export', params ?? {});
}

/**
 * 查询模型管理详情
 * @param id id
 * @returns 模型管理详情
 */
export function modelInfo(id: ID) {
  return requestClient.get<ModelVO>(`/system/model/${id}`);
}

/**
 * 新增模型管理
 * @param data
 * @returns void
 */
export function modelAdd(data: ModelForm) {
  return requestClient.postWithMsg<void>('/system/model', data);
}

/**
 * 更新模型管理
 * @param data
 * @returns void
 */
export function modelUpdate(data: ModelForm) {
  return requestClient.putWithMsg<void>('/system/model', data);
}

/**
 * 删除模型管理
 * @param id id
 * @returns void
 */
export function modelRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/model/${id}`);
}
