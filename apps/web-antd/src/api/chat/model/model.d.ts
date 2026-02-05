import type { BaseEntity, PageQuery } from '#/api/common';

export interface ModelVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 模型分类
   */
  category: string;

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
   * 模型价格
   */
  modelPrice: number;

  /**
   * 计费类型
   */
  modelType: string;

  /**
   * 是否显示
   */
  modelShow: string;

  /**
   * 是否免费
   */
  modelFree: string;

  /**
   * 模型优先级(值越大优先级越高)
   */
  priority: number;

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
   * 模型价格
   */
  modelPrice?: number;

  /**
   * 计费类型
   */
  modelType?: string;

  /**
   * 是否显示
   */
  modelShow?: string;

  /**
   * 是否免费
   */
  modelFree?: string;

  /**
   * 模型优先级(值越大优先级越高)
   */
  priority?: number;

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
   * 模型价格
   */
  modelPrice?: number;

  /**
   * 计费类型
   */
  modelType?: string;

  /**
   * 是否显示
   */
  modelShow?: string;

  /**
   * 是否免费
   */
  modelFree?: string;

  /**
   * 模型优先级(值越大优先级越高)
   */
  priority?: number;

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
