import type { TemplateForm, TemplateQuery, TemplateVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询提示词模板列表
 * @param params
 * @returns 提示词模板列表
 */
export function templateList(params?: TemplateQuery) {
  return requestClient.get<PageResult<TemplateVO>>(
    '/system/promptTemplate/list',
    {
      params,
    },
  );
}

/**
 * 导出提示词模板列表
 * @param params
 * @returns 提示词模板列表
 */
export function templateExport(params?: TemplateQuery) {
  return commonExport('/system/promptTemplate/export', params ?? {});
}

/**
 * 查询提示词模板详情
 * @param id id
 * @returns 提示词模板详情
 */
export function templateInfo(id: ID) {
  return requestClient.get<TemplateVO>(`/system/promptTemplate/${id}`);
}

/**
 * 新增提示词模板
 * @param data
 * @returns void
 */
export function templateAdd(data: TemplateForm) {
  return requestClient.postWithMsg<void>('/system/promptTemplate', data);
}

/**
 * 更新提示词模板
 * @param data
 * @returns void
 */
export function templateUpdate(data: TemplateForm) {
  return requestClient.putWithMsg<void>('/system/promptTemplate', data);
}

/**
 * 删除提示词模板
 * @param id id
 * @returns void
 */
export function templateRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/template/${id}`);
}
