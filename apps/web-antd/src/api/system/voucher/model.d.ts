import type {BaseEntity, PageQuery} from '#/api/common';

export interface VoucherVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 兑换码
   */
  code: string;

  /**
   * 兑换金额
   */
  amount: number;

  /**
   * 用户id
   */
  userId: number | string;

  /**
   * 兑换状态
   */
  status: string;

  /**
   * 兑换前余额
   */
  balanceBefore: number;

  /**
   * 兑换后余额
   */
  balanceAfter: number;

  /**
   * 备注
   */
  remark: string;
}

export interface VoucherForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 兑换码
   */
  code?: string;

  /**
   * 兑换金额
   */
  amount?: number;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 兑换状态
   */
  status?: string;

  /**
   * 兑换前余额
   */
  balanceBefore?: number;

  /**
   * 兑换后余额
   */
  balanceAfter?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface VoucherQuery extends PageQuery {
  /**
   * 兑换码
   */
  code?: string;

  /**
   * 兑换金额
   */
  amount?: number;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 兑换状态
   */
  status?: string;

  /**
   * 兑换前余额
   */
  balanceBefore?: number;

  /**
   * 兑换后余额
   */
  balanceAfter?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
