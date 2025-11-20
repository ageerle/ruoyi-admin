import type { AihumanRealConfigInfo as AihumanRealConfig, AihumanRealConfigQueryParams as AihumanRealConfigQueryParam } from './types';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  root = '/aihuman/aihumanRealConfig',
  list = '/aihuman/aihumanRealConfig/list',
  export = '/aihuman/aihumanRealConfig/export',
  run = '/aihuman/aihumanRealConfig/run',
  stop = '/aihuman/aihumanRealConfig/stop',
}

/**
 * 获取undefined列表
 * @param params 查询参数
 * @returns AihumanRealConfig列表
 */
export function aihumanRealConfigList(params?: PageQuery & AihumanRealConfigQueryParam) {
  return requestClient.get<PageResult<AihumanRealConfig>>(Api.list, { params });
}

/**
 * 获取undefined详情
 * @param id undefinedID
 * @returns AihumanRealConfig详情
 */
export function aihumanRealConfigInfo(id: ID) {
  return requestClient.get<AihumanRealConfig>(`${Api.root}/${id}`);
}

/**
 * 新增undefined
 * @param data undefined数据
 * @returns void
 */
export function aihumanRealConfigAdd(data: Partial<AihumanRealConfig>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新undefined
 * @param data undefined数据
 * @returns void
 */
export function aihumanRealConfigUpdate(data: Partial<AihumanRealConfig>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除undefined
 * @param ids undefinedID数组
 * @returns void
 */
export function aihumanRealConfigRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出undefined
 * @param data 查询参数
 * @returns blob
 */
export function aihumanRealConfigExport(data: Partial<AihumanRealConfigQueryParam>) {
  return commonExport(Api.export, data);
}

/**
 * 保存或更新undefined
 * @param data undefined数据
 * @param isUpdate 是否更新
 * @returns void
 */
export function aihumanRealConfigSaveOrUpdate(data: Partial<AihumanRealConfig>, isUpdate: boolean) {
  if (isUpdate) {
    return aihumanRealConfigUpdate(data);
  } else {
    return aihumanRealConfigAdd(data);
  }
}

/**
 * 启动配置
 * @param id 配置ID
 * @returns void
 */
export function aihumanRealConfigRun(id: number) {
  return requestClient.putWithMsg<void>(Api.run, { id });
}

/**
 * 停止配置
 * @param id 配置ID
 * @returns void
 */
export function aihumanRealConfigStop(id: number) {
  return requestClient.putWithMsg<void>(Api.stop, { id });
}
