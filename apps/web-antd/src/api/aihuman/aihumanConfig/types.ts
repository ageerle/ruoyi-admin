/**
 * 交互数字人配置相关类型定义
 */
 /**
 * 字典枚举定义
 */
export enum AihumanConfigDict {
  /** status */
  sys_normal_disable = 'sys_normal_disable',
  /** publish */
  aihuman_is_publish = 'aihuman_is_publish',
}
/**
 * 交互数字人配置查询参数
 */
export interface AihumanConfigQueryParams {

  /** name */
  name?: string;

  /** modelName */
  modelName?: string;

  /** modelPath */
  modelPath?: string;

  /** modelParams */
  modelParams?: string;

  /** agentParams */
  agentParams?: string;

  /** createTime */
  createTime?: string;

  /** updateTime */
  updateTime?: string;

  /** status */
  status?: number;

  /** publish */
  publish?: number;

  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 交互数字人配置信息
 */
export interface AihumanConfigInfo {

  /** id */
  id?: number;

  /** name */
  name?: string;

  /** modelName */
  modelName?: string;

  /** modelPath */
  modelPath?: string;

  /** modelParams */
  modelParams?: string;

  /** agentParams */
  agentParams?: string;

  /** createTime */
  createTime?: string;

  /** updateTime */
  updateTime?: string;

  /** status */
  status?: number;

  /** publish */
  publish?: number;

}

/**
 * 交互数字人配置表单数据
 */
export interface AihumanConfigFormData {

  /** name */
  name?: string;

  /** modelName */
  modelName?: string;

  /** modelPath */
  modelPath?: string;

  /** modelParams */
  modelParams?: string;

  /** agentParams */
  agentParams?: string;

  /** createTime */
  createTime?: string;

  /** updateTime */
  updateTime?: string;

  /** status */
  status?: number;

  /** publish */
  publish?: number;

}

/**
 * 交互数字人配置列表响应
 */
export interface AihumanConfigListResponse {
  /** 数据列表 */
  rows: AihumanConfigInfo[];
  /** 总数 */
  total: number;
}

/**
 * 导出参数
 */
export interface AihumanConfigExportParams extends AihumanConfigQueryParams {
  /** 文件名 */
  fileName?: string;
  /** 导出格式 */
  format?: 'xlsx' | 'csv';
  /** 导出字段 */
  fields?: string[];
}
