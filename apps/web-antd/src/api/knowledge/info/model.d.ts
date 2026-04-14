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
   * 重排模型
   */
  rerankModel: string;

  /**
   * 是否启用重排（0 否 1 是）
   */
  enableRerank: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 是否启用混合检索（0 否 1 是）
   */
  enableHybrid: number;

  /**
   * 混合检索权重比例 (0.0-1.0)
   */
  hybridAlpha: number;
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
   * 重排模型
   */
  rerankModel?: string;

  /**
   * 是否启用重排（0 否 1 是）
   */
  enableRerank?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 是否启用混合检索（0 否 1 是）
   */
  enableHybrid?: number;

  /**
   * 混合检索权重比例 (0.0-1.0)
   */
  hybridAlpha?: number;
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
