export interface ModelNameVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 模型编号
   */
  modelNo: string;

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
   * 备注
   */
  remark: string;

}

export interface ModelForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型编号
   */
  modelNo?: string;

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
   * 系统提示词
   */
  systemPrompt?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface ModelQuery extends PageQuery {
  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 模型编号
   */
  modelNo?: string;

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

}
