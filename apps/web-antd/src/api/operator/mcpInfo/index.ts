import type { McpInfoInfo as McpInfo, McpInfoQueryParams as McpInfoQueryParam } from './types';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  root = '/operator/mcpInfo',
  list = '/operator/mcpInfo/list',
  export = '/operator/mcpInfo/export',
}

/**
 * 获取undefined列表
 * @param params 查询参数
 * @returns McpInfo列表
 */
export function mcpInfoList(params?: PageQuery & McpInfoQueryParam) {
  return requestClient.get<PageResult<McpInfo>>(Api.list, { params });
}

/**
 * 获取undefined详情
 * @param id undefinedID
 * @returns McpInfo详情
 */
export function mcpInfoInfo(id: ID) {
  return requestClient.get<McpInfo>(`${Api.root}/${id}`);
}

/**
 * 新增undefined
 * @param data undefined数据
 * @returns void
 */
export function mcpInfoAdd(data: Partial<McpInfo>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新undefined
 * @param data undefined数据
 * @returns void
 */
export function mcpInfoUpdate(data: Partial<McpInfo>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除undefined
 * @param ids undefinedID数组
 * @returns void
 */
export function mcpInfoRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出undefined
 * @param data 查询参数
 * @returns blob
 */
export function mcpInfoExport(data: Partial<McpInfoQueryParam>) {
  return commonExport(Api.export, data);
}

/**
 * 保存或更新undefined
 * @param data undefined数据
 * @param isUpdate 是否更新
 * @returns void
 */
export function mcpInfoSaveOrUpdate(data: Partial<McpInfo>, isUpdate: boolean) {
  if (isUpdate) {
    return mcpInfoUpdate(data);
  } else {
    return mcpInfoAdd(data);
  }
}
