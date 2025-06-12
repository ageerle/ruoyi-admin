import type { BaseEntity, PageQuery } from '#/api/common';

export interface TemplateVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 提示词模板名称
   */
  templateName: string;

  /**
   * 提示词模板内容
   */
  templateContent: string;

  /**
   * 提示词分类，knowledge 知识库类型，chat 对话类型，draw绘画类型 ...
   */
  category: string;

  /**
   * 备注
   */
  remark: string;
}

export interface TemplateForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 提示词模板名称
   */
  templateName?: string;

  /**
   * 提示词模板内容
   */
  templateContent?: string;

  /**
   * 提示词分类，knowledge 知识库类型，chat 对话类型，draw绘画类型 ...
   */
  category?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface TemplateQuery extends PageQuery {
  /**
   * 提示词模板名称
   */
  templateName?: string;

  /**
   * 提示词模板内容
   */
  templateContent?: string;

  /**
   * 提示词分类，knowledge 知识库类型，chat 对话类型，draw绘画类型 ...
   */
  category?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
