/**
 * 交互数字人发布相关类型定义
 */

/**
 * 字典枚举定义
 */
export enum AihumanPublishDict {
  /** status */
  sys_normal_disable = 'sys_normal_disable',
  /** publish */
  aihuman_is_publish = 'aihuman_is_publish',
}

/**
 * 交互数字人发布查询参数
 */
export interface AihumanPublishQueryParams {
  /** name */
  name?: string;

  /** modelName */
  modelName?: string;

  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 交互数字人发布信息
 */
export interface AihumanPublishInfo {
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
 * 交互数字人发布列表响应
 */
export interface AihumanPublishListResponse {
  /** 数据列表 */
  rows: AihumanPublishInfo[];
  /** 总数 */
  total: number;
}
