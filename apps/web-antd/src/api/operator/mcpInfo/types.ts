/**
 * MCP相关类型定义
 */

/**
 * MCP查询参数
 */
export interface McpInfoQueryParams {

  /** 服务器名称 */
  serverName?: string;

  /** 链接方式 */
  transportType?: string;

  /** Command */
  command?: string;

  /** 是否启用 */
  status?: string;

  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * MCP信息
 */
export interface McpInfoInfo {

  /** id */
  mcpId?: number;

  /** 服务器名称 */
  serverName?: string;

  /** 链接方式 */
  transportType?: string;

  /** Command */
  command?: string;

  /** Args */
  arguments?: string;

  /** Env */
  env?: string;

  /** 是否启用 */
  status?: string;

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

  /** 备注 */
  remark?: string;

}

/**
 * MCP表单数据
 */
export interface McpInfoFormData {

  /** 服务器名称 */
  serverName?: string;

  /** 链接方式 */
  transportType?: string;

  /** Command */
  command?: string;

  /** Args */
  arguments?: string;

  /** Env */
  env?: string;

  /** 是否启用 */
  status?: string;

}

/**
 * MCP列表响应
 */
export interface McpInfoListResponse {
  /** 数据列表 */
  rows: McpInfoInfo[];
  /** 总数 */
  total: number;
}

/**
 * 导出参数
 */
export interface McpInfoExportParams extends McpInfoQueryParams {
  /** 文件名 */
  fileName?: string;
  /** 导出格式 */
  format?: 'xlsx' | 'csv';
  /** 导出字段 */
  fields?: string[];
}