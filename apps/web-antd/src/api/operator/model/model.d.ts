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
   * 模型描述
   */
  modelDescribe: string;

  /**
   * 模型价格
   */
  modelPrice: number;

  /**
   * 模型优先级
   */
  priority: number;

  /**
   * 计费类型
   */
  modelType: string;

  /**
   * 是否显示
   */
  modelShow: string;

  /**
   * 系统提示词
   */
  systemPrompt: string;

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
   * 模型描述
   */
  modelDescribe?: string;

  /**
   * 模型价格
   */
  modelPrice?: number;

  /**
   * 模型优先级
   */
  priority?: number;

  /**
   * 计费类型
   */
  modelType?: string;

  /**
   * 是否显示
   */
  modelShow?: string;

  /**
   * 系统提示词
   */
  systemPrompt?: string;

  /**
   * 请求地址
   */
  apiHost?: string;

  /**
   * 请求后缀
   */
  apiUrl?: string;

  /**
   * 密钥
   */
  apiKey?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 供应商名称
   */
  providerName?: string;
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
   * 模型描述
   */
  modelDescribe?: string;

  /**
   * 模型价格
   */
  modelPrice?: number;

  /**
   * 模型优先级
   */
  priority?: number;

  /**
   * 计费类型
   */
  modelType?: string;

  /**
   * 是否显示
   */
  modelShow?: string;

  /**
   * 系统提示词
   */
  systemPrompt?: string;

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
