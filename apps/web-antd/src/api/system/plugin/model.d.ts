import type {BaseEntity, PageQuery} from '#/api/common';

export interface PluginVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 插件名称
   */
  name: string;

  /**
   * 插件编码
   */
  code: string;

  /**
   * 备注
   */
  remark: string;
}

export interface PluginForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 插件名称
   */
  name?: string;

  /**
   * 插件编码
   */
  code?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface PluginQuery extends PageQuery {
  /**
   * 插件名称
   */
  name?: string;

  /**
   * 插件编码
   */
  code?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
