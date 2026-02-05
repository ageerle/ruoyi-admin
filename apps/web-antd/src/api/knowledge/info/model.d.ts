import type { PageQuery, BaseEntity } from '#/api/common';

export interface InfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 知识库名称
   */
  name: string;

  /**
   * 是否公开知识库（0 否 1是）
   */
  share: number;

  /**
   * 知识库描述
   */
  description: string;

  /**
   * 知识分隔符
   */
  separator: string;

  /**
   * 重叠字符数
   */
  overlapChar: number;

  /**
   * 知识库中检索的条数
   */
  retrieveLimit: number;

  /**
   * 文本块大小
   */
  textBlockSize: number;

  /**
   * 向量库
   */
  vectorModel: string;

  /**
   * 向量模型
   */
  embeddingModel: string;

  /**
   * 备注
   */
  remark: string;

}

export interface InfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 知识库名称
   */
  name?: string;

  /**
   * 是否公开知识库（0 否 1是）
   */
  share?: number;

  /**
   * 知识库描述
   */
  description?: string;

  /**
   * 知识分隔符
   */
  separator?: string;

  /**
   * 重叠字符数
   */
  overlapChar?: number;

  /**
   * 知识库中检索的条数
   */
  retrieveLimit?: number;

  /**
   * 文本块大小
   */
  textBlockSize?: number;

  /**
   * 向量库
   */
  vectorModel?: string;

  /**
   * 向量模型
   */
  embeddingModel?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface InfoQuery extends PageQuery {
  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 知识库名称
   */
  name?: string;

  /**
   * 是否公开知识库（0 否 1是）
   */
  share?: number;

  /**
   * 知识库描述
   */
  description?: string;

  /**
   * 知识分隔符
   */
  separator?: string;

  /**
   * 重叠字符数
   */
  overlapChar?: number;

  /**
   * 知识库中检索的条数
   */
  retrieveLimit?: number;

  /**
   * 文本块大小
   */
  textBlockSize?: number;

  /**
   * 向量库
   */
  vectorModel?: string;

  /**
   * 向量模型
   */
  embeddingModel?: string;

  /**
    * 日期范围参数
    */
  params?: any;
}
