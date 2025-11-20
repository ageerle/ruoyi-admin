/**
 * 真人交互数字人配置相关类型定义
 */
 /**
 * 字典枚举定义
 */
export enum AihumanRealConfigDict {


sys_normal_disable = 'sys_normal_disable',


  /** 状态 */
  sys_common_status = 'sys_common_status',

  /** 发布状态 */
  aihuman_is_publish = 'aihuman_is_publish',

  /** 运行状态 */
  aihuman_is_run = 'aihuman_is_run',








}
/**
 * 真人交互数字人配置查询参数
 */
export interface AihumanRealConfigQueryParams {

  /** 场景名称 */
  name?: string;

  /** 真人形象名称 */
  avatars?: string;

  /** 模型名称 */
  models?: string;

  /** 形象参数（预留） */
  avatarsParams?: string;

  /** 模型参数（预留） */
  modelsParams?: string;

  /** 智能体参数（扣子） */
  agentParams?: string;

  /** 创建时间 */
  createTime?: string;

  /** 更新时间 */
  updateTime?: string;

  /** 状态 */
  status?: number;

  /** 发布状态 */
  publish?: number;

  /** 创建部门 */
  createDept?: string;

  /** 创建用户 */
  createBy?: string;

  /** 更新用户 */
  updateBy?: string;

  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 真人交互数字人配置信息
 */
export interface AihumanRealConfigInfo {

  /** 主键id */
  id?: number;

  /** 场景名称 */
  name?: string;

  /** 真人形象名称 */
  avatars?: string;

  /** 模型名称 */
  models?: string;

  /** 形象参数（预留） */
  avatarsParams?: string;

  /** 模型参数（预留） */
  modelsParams?: string;

  /** 智能体参数（扣子） */
  agentParams?: string;

  /** 启动参数 */
  runParams?: string;

  /** 创建时间 */
  createTime?: string;

  /** 更新时间 */
  updateTime?: string;

  /** 状态 */
  status?: number;

  /** 发布状态 */
  publish?: number;

  /** 运行状态 (0: 未运行, 1: 运行中) */
  runStatus?: number;

  /** 创建部门 */
  createDept?: string;

  /** 创建用户 */
  createBy?: string;

  /** 更新用户 */
  updateBy?: string;

}

/**
 * 真人交互数字人配置表单数据
 */
export interface AihumanRealConfigFormData {

  /** 场景名称 */
  name?: string;

  /** 真人形象名称 */
  avatars?: string;

  /** 模型名称 */
  models?: string;

  /** 形象参数（预留） */
  avatarsParams?: string;

  /** 模型参数（预留） */
  modelsParams?: string;

  /** 智能体参数（扣子） */
  agentParams?: string;

  /** 启动参数 */
  runParams?: string;

  /** 创建时间 */
  createTime?: string;

  /** 更新时间 */
  updateTime?: string;

  /** 状态 */
  status?: number;

  /** 发布状态 */
  publish?: number;

  /** 创建部门 */
  createDept?: string;

  /** 创建用户 */
  createBy?: string;

  /** 更新用户 */
  updateBy?: string;

}

/**
 * 真人交互数字人配置列表响应
 */
export interface AihumanRealConfigListResponse {
  /** 数据列表 */
  rows: AihumanRealConfigInfo[];
  /** 总数 */
  total: number;
}

/**
 * 导出参数
 */
export interface AihumanRealConfigExportParams extends AihumanRealConfigQueryParams {
  /** 文件名 */
  fileName?: string;
  /** 导出格式 */
  format?: 'xlsx' | 'csv';
  /** 导出字段 */
  fields?: string[];
}
