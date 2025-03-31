import type { BaseEntity, PageQuery } from '#/api/common';

export interface DemoVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 排序号
   */
  orderNum: number;

  /**
   * key键
   */
  testKey: string;

  /**
   * 值
   */
  value: string;

  /**
   * 版本
   */
  version: number;
}

export interface DemoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 排序号
   */
  orderNum?: number;

  /**
   * key键
   */
  testKey?: string;

  /**
   * 值
   */
  value?: string;

  /**
   * 版本
   */
  version?: number;
}

export interface DemoQuery extends PageQuery {
  /**
   * 排序号
   */
  orderNum?: number;

  /**
   * key键
   */
  testKey?: string;

  /**
   * 值
   */
  value?: string;

  /**
   * 版本
   */
  version?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
