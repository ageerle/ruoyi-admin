import type { PageQuery, BaseEntity } from '#/api/common';

export interface FragmentVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 附件ID
   */
  attachId: string | number;

  /**
   * 片段索引下标
   */
  idx: string | number;

  /**
   * 文档内容
   */
  content: string;

  /**
   * 备注
   */
  remark: string;

}

export interface FragmentForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 附件ID
   */
  attachId?: string | number;

  /**
   * 片段索引下标
   */
  idx?: string | number;

  /**
   * 文档内容
   */
  content?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface FragmentQuery extends PageQuery {
  /**
   * 附件ID
   */
  attachId?: string | number;

  /**
   * 片段索引下标
   */
  idx?: string | number;

  /**
   * 文档内容
   */
  content?: string;

  /**
    * 日期范围参数
    */
  params?: any;
}
