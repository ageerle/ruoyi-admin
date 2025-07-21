import type { SchemaInfo as Schema, SchemaQueryParams as SchemaQueryParam } from './schema/types';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  root = '/dev/schema',
  list = '/dev/schema/list',
  export = '/dev/schema/export',
}

/**
 * 获取null列表
 * @param params 查询参数
 * @returns Schema列表
 */
export function schemaList(params?: PageQuery & SchemaQueryParam) {
  return requestClient.get<PageResult<Schema>>(Api.list, { params });
}

/**
 * 获取null详情
 * @param id nullID
 * @returns Schema详情
 */
export function schemaInfo(id: ID) {
  return requestClient.get<Schema>(`${Api.root}/${id}`);
}

/**
 * 新增null
 * @param data null数据
 * @returns void
 */
export function schemaAdd(data: Partial<Schema>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新null
 * @param data null数据
 * @returns void
 */
export function schemaUpdate(data: Partial<Schema>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除null
 * @param ids nullID数组
 * @returns void
 */
export function schemaRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出null
 * @param data 查询参数
 * @returns blob
 */
export function schemaExport(data: Partial<SchemaQueryParam>) {
  return commonExport(Api.export, data);
}

/**
 * 保存或更新null
 * @param data null数据
 * @param isUpdate 是否更新
 * @returns void
 */
export function schemaSaveOrUpdate(data: Partial<Schema>, isUpdate: boolean) {
  if (isUpdate) {
    return schemaUpdate(data);
  } else {
    return schemaAdd(data);
  }
}