import type {IDS, PageQuery, PageResult} from '#/api/common';

import {requestClient} from '#/api/request';

// 字段信息接口
export interface SchemaField {
  id?: number;
  schemaId?: number;
  name?: string;
  code?: string;
  type?: string;
  comment?: string;
  isPk?: string;
  isRequired?: string;
  defaultValue?: string;
  length?: number;
  scale?: number;
  sort?: number;
  isList?: string;
  isQuery?: string;
  isInsert?: string;
  isEdit?: string;
  queryType?: string;
  htmlType?: string;
  dictType?: string;
  status?: string;
  remark?: string;
  createDept?: number;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
}

// 字段表单接口
export interface SchemaFieldForm {
  id?: number;
  schemaId?: number;
  schemaName?: string;
  name?: string;
  code?: string;
  type?: string;
  comment?: string;
  isPk?: string;
  isRequired?: string;
  defaultValue?: string;
  length?: number;
  scale?: number;
  sort?: number;
  isList?: string;
  isQuery?: string;
  isInsert?: string;
  isEdit?: string;
  queryType?: string;
  htmlType?: string;
  dictType?: string;
}

// 查询参数接口
export interface SchemaFieldQueryParams {
  schemaId?: number;
  name?: string;
  code?: string;
  type?: string;
  status?: string;
}

enum Api {
  list = '/dev/schemaField/list',
  info = '/dev/schemaField',
  add = '/dev/schemaField',
  edit = '/dev/schemaField',
  del = '/dev/schemaField',
  batchUpdate = '/dev/schemaField/batchUpdate',
}

/**
 * 获取字段列表
 * @param params 查询参数
 * @returns 字段列表
 */
export function getSchemaFieldList(params?: PageQuery & SchemaFieldQueryParams) {
  return requestClient.get<PageResult<SchemaField>>(Api.list, {params});
}

/**
 * 新增字段
 * @param data 字段数据
 * @returns void
 */
export function addSchemaField(data: Partial<SchemaField>) {
  return requestClient.postWithMsg<void>(Api.add, data);
}

/**
 * 更新字段
 * @param data 字段数据
 * @returns void
 */
export function updateSchemaField(data: Partial<SchemaField>) {
  return requestClient.putWithMsg<void>(Api.edit, data);
}

/**
 * 删除字段
 * @param ids 字段ID数组
 * @returns void
 */
export function deleteSchemaField(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.del}/${ids}`);
}
