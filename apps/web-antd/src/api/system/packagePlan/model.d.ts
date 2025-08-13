import type {BaseEntity, PageQuery} from '#/api/common';

export interface PackagePlanVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 套餐名称
   */
  name: string;

  /**
   * 套餐价格
   */
  price: number;

  /**
   * 有效时间
   */
  duration: number;

  /**
   * 计划详情
   */
  planDetail: string;

  /**
   * 备注
   */
  remark: string;
}

export interface PackagePlanForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 套餐名称
   */
  name?: string;

  /**
   * 套餐价格
   */
  price?: number;

  /**
   * 有效时间
   */
  duration?: number;

  /**
   * 计划详情
   */
  planDetail?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PackagePlanQuery extends PageQuery {
  /**
   * 套餐名称
   */
  name?: string;

  /**
   * 套餐价格
   */
  price?: number;

  /**
   * 有效时间
   */
  duration?: number;

  /**
   * 计划详情
   */
  planDetail?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
