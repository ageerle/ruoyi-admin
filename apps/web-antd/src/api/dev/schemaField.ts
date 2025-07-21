import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

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
  root = '/dev/schemaField',
  list = '/dev/schemaField/list',
  listBySchemaId = '/dev/schemaField/listBySchemaId',
  batchUpdate = '/dev/schemaField/batchUpdate',
}

/**
 * 获取字段列表
 * @param params 查询参数
 * @returns 字段列表
 */
export function getSchemaFieldList(params?: PageQuery & SchemaFieldQueryParams) {
  return requestClient.get<PageResult<SchemaField>>(Api.list, { params });
}

/**
 * 根据模型ID获取字段列表
 * @param schemaId 模型ID
 * @returns 字段列表
 */
export function getSchemaFieldListBySchemaId(schemaId: ID) {
  return requestClient.get<SchemaField[]>(`${Api.listBySchemaId}/${schemaId}`);
}

/**
 * 获取字段详情
 * @param id 字段ID
 * @returns 字段详情
 */
export function getSchemaFieldInfo(id: ID) {
  return requestClient.get<SchemaField>(`${Api.root}/${id}`);
}

/**
 * 新增字段
 * @param data 字段数据
 * @returns void
 */
export function addSchemaField(data: Partial<SchemaField>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * 更新字段
 * @param data 字段数据
 * @returns void
 */
export function updateSchemaField(data: Partial<SchemaField>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * 删除字段
 * @param ids 字段ID数组
 * @returns void
 */
export function deleteSchemaField(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 批量更新字段配置
 * @param fields 字段配置列表
 * @returns void
 */
export function batchUpdateSchemaFieldConfig(fields: Partial<SchemaField>[]) {
  return requestClient.putWithMsg<void>(Api.batchUpdate, fields);
}

/**
 * 保存或更新字段
 * @param data 字段数据
 * @param isUpdate 是否更新
 * @returns void
 */
export function saveOrUpdateSchemaField(data: Partial<SchemaField>, isUpdate: boolean) {
  if (isUpdate) {
    return updateSchemaField(data);
  } else {
    return addSchemaField(data);
  }
}