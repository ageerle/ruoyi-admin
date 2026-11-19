import type { BaseEntity, PageQuery } from '#/api/common';

export interface VisionDefaultSettings {
  modelName: null | string;
  options: {
    modelDescribe?: null | string;
    modelName: string;
    providerCode: string;
  }[];
}

export interface ModelVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 模型分类
   */
  category: string;

  supportsVision?: boolean;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 模型供应商
   */
  providerCode: number | string;

  /**
   * 模型描述
   */
  modelDescribe: string;

  /**
   * 是否显示
   */
  modelShow: string;
  sortOrder: number;

  /**
   * 模型维度
   */
  modelDimension: number;

  /**
   * 请求地址
   */
  apiHost: string;

  /**
   * 密钥
   */
  apiKey: string;

  /**
   * 备注
   */
  remark: string;
}

export interface ModelForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 模型分类
   */
  category?: string;

  supportsVision?: boolean;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型供应商
   */
  providerCode?: number | string;

  /**
   * 模型描述
   */
  modelDescribe?: string;

  /**
   * 是否显示
   */
  modelShow?: string;
  sortOrder?: number;

  /**
   * 模型维度
   */
  modelDimension?: number;

  /**
   * 请求地址
   */
  apiHost?: string;

  /**
   * 密钥
   */
  apiKey?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface ModelQuery extends PageQuery {
  /**
   * 模型分类
   */
  category?: string;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型供应商
   */
  providerCode?: number | string;

  /**
   * 模型描述
   */
  modelDescribe?: string;

  /**
   * 是否显示
   */
  modelShow?: string;

  /**
   * 模型维度
   */
  modelDimension?: number;

  /**
   * 请求地址
   */
  apiHost?: string;

  /**
   * 密钥
   */
  apiKey?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
