/**
 * 数据模型表相关类型定义
 */

/**
 * 数据模型表查询参数
 */
export interface SchemaQueryParams {

  /** 分组ID */
  schemaGroupId?: number;

  /** 模型名称 */
  name?: string;

  /** 模型编码 */
  code?: string;

  /** 表名 */
  tableName?: string;

  /** 表注释 */
  comment?: string;

  /** 存储引擎 */
  engine?: string;

  /** 列表字段 */
  listKeys?: string;

  /** 搜索表单字段 */
  searchFormKeys?: string;

  /** 表单设计 */
  designer?: string;

  /** 状态（0正常 1停用） */
  status?: string;

  /** 排序 */
  sort?: number;

  /** 备注 */
  remark?: string;

  /** 删除标志（0代表存在 2代表删除） */
  delFlag?: string;

  /** 租户编号 */
  tenantId?: string;

  /** 创建部门 */
  createDept?: number;

  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 数据模型表信息
 */
export interface SchemaInfo {

  /** 主键 */
  id?: number;

  /** 分组ID */
  schemaGroupId?: number;

  /** 模型名称 */
  name?: string;

  /** 模型编码 */
  code?: string;

  /** 表名 */
  tableName?: string;

  /** 表注释 */
  comment?: string;

  /** 存储引擎 */
  engine?: string;

  /** 列表字段 */
  listKeys?: string;

  /** 搜索表单字段 */
  searchFormKeys?: string;

  /** 表单设计 */
  designer?: string;

  /** 状态（0正常 1停用） */
  status?: string;

  /** 排序 */
  sort?: number;

  /** 备注 */
  remark?: string;

  /** 删除标志（0代表存在 2代表删除） */
  delFlag?: string;

  /** 租户编号 */
  tenantId?: string;

  /** 创建部门 */
  createDept?: number;

  /** 创建者 */
  createBy?: number;

  /** 创建时间 */
  createTime?: string;

  /** 更新者 */
  updateBy?: number;

  /** 更新时间 */
  updateTime?: string;

}

/**
 * 数据模型表表单数据
 */
export interface SchemaFormData {

  /** 分组ID */
  schemaGroupId?: number;

  /** 模型名称 */
  name?: string;

  /** 模型编码 */
  code?: string;

  /** 表名 */
  tableName?: string;

  /** 表注释 */
  comment?: string;

  /** 存储引擎 */
  engine?: string;

  /** 列表字段 */
  listKeys?: string;

  /** 搜索表单字段 */
  searchFormKeys?: string;

  /** 表单设计 */
  designer?: string;

  /** 状态（0正常 1停用） */
  status?: string;

  /** 排序 */
  sort?: number;

  /** 备注 */
  remark?: string;

  /** 删除标志（0代表存在 2代表删除） */
  delFlag?: string;

  /** 租户编号 */
  tenantId?: string;

  /** 创建部门 */
  createDept?: number;

  /** 创建者 */
  createBy?: number;

  /** 更新者 */
  updateBy?: number;

}

/**
 * 数据模型表列表响应
 */
export interface SchemaListResponse {
  /** 数据列表 */
  rows: SchemaInfo[];
  /** 总数 */
  total: number;
}

/**
 * 导出参数
 */
export interface SchemaExportParams extends SchemaQueryParams {
  /** 文件名 */
  fileName?: string;
  /** 导出格式 */
  format?: 'xlsx' | 'csv';
  /** 导出字段 */
  fields?: string[];
}