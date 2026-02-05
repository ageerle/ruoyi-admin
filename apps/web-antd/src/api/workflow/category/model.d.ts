import type { BaseEntity } from '#/api/common';

export interface CategoryVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 分类编码
   */
  categoryCode: string;

  /**
   * 父级id
   */
  parentId: number | string;

  /**
   * 排序
   */
  sortNum: number;

  /**
   * 子对象
   */
  children: CategoryVO[];
  key: string;
}

export interface CategoryForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  categoryCode?: string;

  /**
   * 父级id
   */
  parentId?: number | string;

  /**
   * 排序
   */
  sortNum?: number;
}

export interface CategoryQuery {
  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类编码
   */
  categoryCode?: string;

  /**
   * 父级id
   */
  parentId?: number | string;

  /**
   * 排序
   */
  sortNum?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface CategoryTree {
  id: number;
  parentId: number;
  label: string;
  weight: number;
  children: CategoryTree[];
  key: string;
}
