import type { ProcessDefinition } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * 全部的流程定义
 * @param params 查询参数
 * @returns 分页
 */
export function workflowDefinitionList(params?: PageQuery) {
  return requestClient.get<PageResult<ProcessDefinition>>(
    '/workflow/definition/list',
    { params },
  );
}

/**
 * 未发布的流程定义
 * @param params 查询参数
 * @returns 分页
 */
export function unPublishList(params?: PageQuery) {
  return requestClient.get<PageResult<ProcessDefinition>>(
    '/workflow/definition/unPublishList',
    { params },
  );
}

/**
 * 获取历史流程定义列表
 * @param flowCode
 * @returns ProcessDefinition[]
 */
export function getHisListByKey(flowCode: string) {
  return requestClient.get<ProcessDefinition[]>(
    `/workflow/definition/getHisListByKey/${flowCode}`,
  );
}

/**
 * 获取流程定义详细信息
 * @param id id
 * @returns ProcessDefinition
 */
export function workflowDefinitionInfo(id: ID) {
  return requestClient.get<ProcessDefinition>(`/workflow/definition/${id}`);
}

/**
 * 新增流程定义
 * @param data
 */
export function workflowDefinitionAdd(data: any) {
  return requestClient.postWithMsg<void>('/workflow/definition', data);
}

/**
 * 更新流程定义
 * @param data
 */
export function workflowDefinitionUpdate(data: any) {
  return requestClient.putWithMsg<void>('/workflow/definition', data);
}

/**
 * 发布流程定义
 * @param id id
 * @returns boolean
 */
export function workflowDefinitionPublish(id: ID) {
  return requestClient.putWithMsg<boolean>(
    `/workflow/definition/publish/${id}`,
  );
}

/**
 * 取消发布流程定义
 * @param id id
 * @returns boolean
 */
export function workflowDefinitionUnPublish(id: ID) {
  return requestClient.putWithMsg<boolean>(
    `/workflow/definition/unPublish/${id}`,
  );
}

/**
 * 删除流程定义
 * @param ids idList
 */
export function workflowDefinitionDelete(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`/workflow/definition/${ids}`);
}

/**
 * 复制流程定义
 * @param id id
 */
export function workflowDefinitionCopy(id: ID) {
  return requestClient.postWithMsg<void>(`/workflow/definition/copy/${id}`);
}

/**
 * 导入流程定义
 * @returns boolean
 */
export function workflowDefinitionImport(data: {
  category: ID;
  file: Blob | File;
}) {
  return requestClient.postWithMsg<boolean>(
    '/workflow/definition/importDef',
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
}

/**
 * 导出流程定义
 * @param id id
 * @returns blob
 */
export function workflowDefinitionExport(id: ID) {
  return requestClient.postWithMsg<Blob>(
    `/workflow/definition/exportDef/${id}`,
    {},
    {
      responseType: 'blob',
      isTransformResponse: false,
    },
  );
}

/**
 * 获取流程定义xml字符串
 * @param id id
 * @returns xml
 */
export function workflowDefinitionXml(id: ID) {
  return requestClient.get<string>(`/workflow/definition/xmlString/${id}`);
}

/**
 * 激活/挂起流程定义
 * @param id 流程定义id
 * @param active 激活/挂起
 * @returns boolean
 */
export function workflowDefinitionActive(id: ID, active: boolean) {
  return requestClient.putWithMsg<boolean>(
    `/workflow/definition/active/${id}?active=${active}`,
  );
}
