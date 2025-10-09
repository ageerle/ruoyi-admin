import type { AihumanConfigInfo as AihumanConfig, AihumanConfigQueryParams as AihumanConfigQueryParam } from './types';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  root = '/aihuman/aihumanConfig',
  list = '/aihuman/aihumanConfig/list',
  export = '/aihuman/aihumanConfig/export',
}

/**
 * 获取undefined列表
 * @param params 查询参数
 * @returns AihumanConfig列表
 */
export function aihumanConfigList(params?: PageQuery & AihumanConfigQueryParam) {
  return requestClient.get<PageResult<AihumanConfig>>(Api.list, { params });
}

/**
 * 获取undefined详情
 * @param id undefinedID
 * @returns AihumanConfig详情
 */
export function aihumanConfigInfo(id: ID) {
  return requestClient.get<AihumanConfig>(`${Api.root}/${id}`);
}

/**
 * 新增undefined
 * @param data undefined数据
 * @returns void
 */
export function aihumanConfigAdd(data: Partial<AihumanConfig>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新undefined
 * @param data undefined数据
 * @returns void
 */
export function aihumanConfigUpdate(data: Partial<AihumanConfig>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除undefined
 * @param ids undefinedID数组
 * @returns void
 */
export function aihumanConfigRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出undefined
 * @param data 查询参数
 * @returns blob
 */
export function aihumanConfigExport(data: Partial<AihumanConfigQueryParam>) {
  return commonExport(Api.export, data);
}

/**
 * 保存或更新undefined
 * @param data undefined数据
 * @param isUpdate 是否更新
 * @returns void
 */
export function aihumanConfigSaveOrUpdate(data: Partial<AihumanConfig>, isUpdate: boolean) {
  if (isUpdate) {
    return aihumanConfigUpdate(data);
  } else {
    return aihumanConfigAdd(data);
  }
}
