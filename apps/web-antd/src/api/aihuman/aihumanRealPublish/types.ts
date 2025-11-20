/**
 * 真人交互数字人发布配置相关类型定义
 * 注：专注于运行中(runStatus=1)的配置
 */

/**
 * 字典枚举定义（从AihumanRealConfigDict继承使用）
 */
import { AihumanRealConfigDict } from '#/api/aihuman/aihumanRealConfig/types';

/**
 * 真人交互数字人发布配置查询参数
 */
export interface AihumanRealPublishQueryParams {
  /** 场景名称 */
  name?: string;
  
  /** 真人形象名称 */
  avatars?: string;
  
  /** 模型名称 */
  models?: string;
  
  /** 创建时间范围 */
  createTimeRange?: [string, string];
  
  /** 页码 */
  pageNum?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 真人交互数字人发布配置信息
 * 注：仅包含运行中(runStatus=1)的配置
 */
export interface AihumanRealPublishInfo {
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
 * 真人交互数字人发布配置列表响应
 */
export interface AihumanRealPublishListResponse {
  /** 数据列表 */
  rows: AihumanRealPublishInfo[];
  /** 总数 */
  total: number;
}

/**
 * 导出参数
 */
export interface AihumanRealPublishExportParams extends AihumanRealPublishQueryParams {
  /** 文件名 */
  fileName?: string;
  /** 导出格式 */
  format?: 'xlsx' | 'csv';
  /** 导出字段 */
  fields?: string[];
}
}