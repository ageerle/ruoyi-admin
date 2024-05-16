export interface OrdersVO {
  /**
   * 主键
   */
  id: string | number;

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
  userId: string | number;

  /**
   * 备注
   */
  remark: string;

}

export interface OrdersForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

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
  userId?: string | number;

  /**
   * 备注
   */
  remark?: string;

}

export interface OrdersQuery extends PageQuery {
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
  userId?: string | number;

}
