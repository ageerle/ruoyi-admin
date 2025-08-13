import {requestClient} from '#/api/request';

export namespace SchemaGroupApi {
  /** 模型分组信息 */
  export interface SchemaGroupInfo {
    id?: string;
    name: string;
    code: string;
    icon?: string;
    sort?: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 表单数据类型 */
  export interface SchemaGroupForm extends SchemaGroupInfo {
  }

  /** 分页查询参数 */
  export interface PageParams {
    pageNum: number;
    pageSize: number;
    name?: string;
    code?: string;
  }

  /** 分页查询结果 */
  export interface PageResult {
    records: SchemaGroupInfo[];
    total: number;
    pageSize: number;
    pageNum: number;
  }

  /** 选择项 */
  export interface SelectOption {
    label: string;
    value: string;
  }
}

/**
 * 分页查询模型分组列表
 */
export async function devSchemaGroupPage(params: SchemaGroupApi.PageParams) {
  return requestClient.get<SchemaGroupApi.PageResult>('/dev/schemaGroup/list', {params});
}

/**
 * 查询模型分组选择项
 */
export async function devSchemaGroupSelect() {
  return requestClient.get<SchemaGroupApi.SchemaGroupInfo[]>('/dev/schemaGroup/select');
}

/**
 * 添加模型分组
 */
export async function devSchemaGroupAdd(data: SchemaGroupApi.SchemaGroupInfo) {
  return requestClient.post('/dev/schemaGroup', data);
}

/**
 * 编辑模型分组
 */
export async function devSchemaGroupEdit(data: SchemaGroupApi.SchemaGroupInfo) {
  return requestClient.put('/dev/schemaGroup', data);
}

/**
 * 模型分组详情
 */
export async function devSchemaGroupDetail(params: { id: string }) {
  return requestClient.get<SchemaGroupApi.SchemaGroupInfo>(`/dev/schemaGroup/${params.id}`);
}

/**
 * 删除模型分组
 */
export async function devSchemaGroupDel(params: { ids: string[] }) {
  return requestClient.delete(`/dev/schemaGroup/${params.ids.join(',')}`);
}

/**
 * 保存或更新模型分组
 */
export async function devSchemaGroupSaveOrUpdate(data: SchemaGroupApi.SchemaGroupInfo, isUpdate: boolean) {
  if (isUpdate) {
    return devSchemaGroupEdit(data);
  } else {
    return devSchemaGroupAdd(data);
  }
}

// 导出类型
export type SchemaGroupForm = SchemaGroupApi.SchemaGroupForm;
