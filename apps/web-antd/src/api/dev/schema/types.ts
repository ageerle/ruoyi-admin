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

  /** 备注 */
  remark?: string;

  /** 删除标志（0代表存在 2代表删除） */
  delFlag?: string;

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

  /** 表名 */
  tableName?: string;

  /** 表注释 */
  comment?: string;

  /** 备注 */
  remark?: string;
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


/**
 * 前端脚本参数
 */
export interface SchemaGenerateParams {
  /** 表名 */
  tableName?: string;
  /** 是否覆盖 */
  isCover?: boolean;
  /** 前端/后端 */
  genType?: string;
  /** 自定义数据 */
  data?: string;
  /** 本地代码路径 */
  workPath?: string;
  /** 预览指令 */
  previewCode?: string;
}
