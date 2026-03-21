import type { PageQuery, BaseEntity } from '#/api/common';

export interface AttachVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 知识库ID
   */
  knowledgeId: string | number;

  /**
   * 附件名称
   */
  name: string;

  /**
   * 附件类型
   */
  type: string;

  /**
   * 对象存储ID
   */
  ossId: string | number;

  /**
   * 文档内容
   */
  content: string;

  /**
   * 备注
   */
  remark: string;

}

export interface AttachForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 知识库ID
   */
  knowledgeId?: string | number;

  /**
   * 附件名称
   */
  name?: string;

  /**
   * 附件类型
   */
  type?: string;

  /**
   * 对象存储ID
   */
  ossId?: string | number;

  /**
   * 文档内容
   */
  content?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface AttachQuery extends PageQuery {
  /**
   * 知识库ID
   */
  knowledgeId?: string | number;

  /**
   * 附件名称
   */
  name?: string;

  /**
   * 附件类型
   */
  type?: string;

  /**
   * 对象存储ID
   */
  ossId?: string | number;

  /**
   * 文档内容
   */
  content?: string;

  /**
    * 日期范围参数
    */
  params?: any;
}
