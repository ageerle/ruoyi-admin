import type { BaseEntity, PageQuery } from '#/api/common';

export interface LeaveVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 请假类型
   */
  leaveType: string;

  /**
   * 开始时间
   */
  startDate: string;

  /**
   * 结束时间
   */
  endDate: string;

  /**
   * 请假天数
   */
  leaveDays: number;

  /**
   * 请假原因
   */
  remark: string;

  /**
   *
   */
  status: string;
}

export interface LeaveForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 请假类型
   */
  leaveType?: string;

  /**
   * 开始时间
   */
  startDate?: string;

  /**
   * 结束时间
   */
  endDate?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

  /**
   * 请假原因
   */
  remark?: string;

  /**
   *
   */
  status?: string;
}

export interface LeaveQuery extends PageQuery {
  /**
   * 请假类型
   */
  leaveType?: string;

  /**
   * 开始时间
   */
  startDate?: string;

  /**
   * 结束时间
   */
  endDate?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

  /**
   *
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
