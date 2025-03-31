import type { BaseEntity } from '#/api/common';

export interface TreeVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 父id
   */
  parentId: number | string;

  /**
   * 部门id
   */
  deptId: number | string;

  /**
   * 用户id
   */
  userId: number | string;

  /**
   * 值
   */
  treeName: string;

  /**
   * 版本
   */
  version: number;

  /**
   * 子对象
   */
  children: TreeVO[];
}

export interface TreeForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 父id
   */
  parentId?: number | string;

  /**
   * 部门id
   */
  deptId?: number | string;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 值
   */
  treeName?: string;

  /**
   * 版本
   */
  version?: number;
}

export interface TreeQuery {
  /**
   * 父id
   */
  parentId?: number | string;

  /**
   * 部门id
   */
  deptId?: number | string;

  /**
   * 用户id
   */
  userId?: number | string;

  /**
   * 值
   */
  treeName?: string;

  /**
   * 版本
   */
  version?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
