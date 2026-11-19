import type { PageQuery, BaseEntity } from '#/api/common';

export interface FragmentVO {
  knowledgeId: string | number;
  /**
   * 
   */
  id: string | number;

  /**
   * 附件ID
   */
  attachId: string | number;

  /**
   * 文档ID
   */
  docId: string;

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
  knowledgeId?: string | number;
  /**
   * 
   */
  id?: string | number;

  /**
   * 附件ID
   */
  attachId?: string | number;

  /**
   * 文档ID
   */
  docId?: string;

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
  knowledgeId?: string | number;
  /**
   * 附件ID
   */
  attachId?: string | number;

  /**
   * 文档ID
   */
  docId?: string;

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
