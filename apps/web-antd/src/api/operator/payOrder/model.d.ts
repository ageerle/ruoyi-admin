import type { BaseEntity, PageQuery } from '#/api/common';

export interface PayOrderVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 订单编号
   */
  orderNo: string;

  /**
   * 订单名称
   */
  orderName: string;

  /**
   * 金额
   */
  amount: number;

  /**
   * 支付状态
   */
  paymentStatus: string;

  /**
   * 支付方式
   */
  paymentMethod: string;

  /**
   * 用户ID
   */
  userId: number | string;

  /**
   * 备注
   */
  remark: string;
}

export interface PayOrderForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 订单编号
   */
  orderNo?: string;

  /**
   * 订单名称
   */
  orderName?: string;

  /**
   * 金额
   */
  amount?: number;

  /**
   * 支付状态
   */
  paymentStatus?: string;

  /**
   * 支付方式
   */
  paymentMethod?: string;

  /**
   * 用户ID
   */
  userId?: number | string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PayOrderQuery extends PageQuery {
  /**
   * 订单编号
   */
  orderNo?: string;

  /**
   * 订单名称
   */
  orderName?: string;

  /**
   * 金额
   */
  amount?: number;

  /**
   * 支付状态
   */
  paymentStatus?: string;

  /**
   * 支付方式
   */
  paymentMethod?: string;

  /**
   * 用户ID
   */
  userId?: number | string;

  /**
   * 日期范围参数
   */
  params?: any;
}
