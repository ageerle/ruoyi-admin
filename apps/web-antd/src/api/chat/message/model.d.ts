import type { BaseEntity, PageQuery } from '#/api/common';

export interface MessageVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 会话id
   */
  sessionId: number | string;

  /**
   * 用户id
   */
  userId: number | string;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 对话角色
   */
  role: string;

  /**
   * 累计 Tokens
   */
  totalTokens: number;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 备注
   */
  remark: string;
}

export interface MessageForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 会话id
   */
  sessionId?: number | string;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 对话角色
   */
  role?: string;

  /**
   * 累计 Tokens
   */
  totalTokens?: number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface MessageQuery extends PageQuery {
  /**
   * 会话id
   */
  sessionId?: number | string;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 对话角色
   */
  role?: string;

  /**
   * 累计 Tokens
   */
  totalTokens?: number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
