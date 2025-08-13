import type {SchemaInfo as Schema, SchemaQueryParams as SchemaQueryParam} from './types';

import type {ID, IDS, PageQuery, PageResult} from '#/api/common';

import {commonExport} from '#/api/helper';
import {requestClient} from '#/api/request';

enum Api {
  root = '/dev/schema',
  list = '/dev/schema/list',
  export = '/dev/schema/export',
  getDataNames = '/dev/schema/getDataNames',
  batchGenCode = '/tool/gen/batchGenCode',
  batchGenFrontendCode = '/tool/gen/batchGenFrontendCode',
}

/**
 * 获取数据模型列表
 * @param params 查询参数
 * @returns Schema列表
 */
export function schemaList(params?: PageQuery & SchemaQueryParam) {
  return requestClient.get<PageResult<Schema>>(Api.list, {params});
}

/**
 * 获取数据模型详情
 * @param id 数据模型ID
 * @returns Schema详情
 */
export function schemaInfo(id: ID) {
  return requestClient.get<Schema>(`${Api.root}/${id}`);
}

/**
 * 新增数据模型
 * @param data 数据模型数据
 * @returns void
 */
export function schemaAdd(data: Partial<Schema>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新数据模型
 * @param data 数据模型数据
 * @returns void
 */
export function schemaUpdate(data: Partial<Schema>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除数据模型
 * @param ids 数据模型ID数组
 * @returns void
 */
export function schemaRemove(ids: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 导出数据模型
 * @param data 查询参数
 * @returns blob
 */
export function schemaExport(data: Partial<SchemaQueryParam>) {
  return commonExport(Api.export, data);
}

/**
 * 获取数据表名列表
 * @returns 数据表名列表
 */
export function getDataNames() {
  return requestClient.get<string[]>(Api.getDataNames);
}

/**
 * 生成前端代码
 * @returns
 */
export function batchGenFrontendCode(workPath: string, previewCode: string) {
  return requestClient.get<string>(`${Api.batchGenFrontendCode}?workPath=${encodeURIComponent(workPath)}&previewCode=${encodeURIComponent(previewCode)}`);
}

/**
 * 生成后端代码
 * @returns
 */
export function batchGenCode(tableName: string) {
  return requestClient.get<string>(`${Api.batchGenCode}?tableNameStr=${tableName}`);
}
