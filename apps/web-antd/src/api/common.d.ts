export type ID = number | string;
export type IDS = (number | string)[];

export interface BaseEntity {
  createBy?: string;
  createDept?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 分页信息
 * @param rows 结果集
 * @param total 总数
 */
export interface PageResult<T = any> {
  rows: T[];
  total: number;
}

/**
 * 分页查询参数
 * @param pageNum 当前页
 * @param pageSize 每页大小
 * @param orderByColumn 排序字段
 * @param isAsc 是否升序
 */
export interface PageQuery {
  isAsc?: boolean;
  orderByColumn?: string;
  pageNum?: number;
  pageSize?: number;
}
