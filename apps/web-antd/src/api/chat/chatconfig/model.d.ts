import type { BaseEntity, PageQuery } from '#/api/common';

export interface ConfigVO {
  /**
   * 主键
   */
  id: number | string;

  /**
   * 配置类型
   */
  category: string;

  /**
   * 配置名称
   */
  configName: string;

  /**
   * 配置值
   */
  configValue: string;

  /**
   * 说明
   */
  configDict: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 更新IP
   */
  updateIp: string;
}

export interface ConfigForm extends BaseEntity {
  /**
   * 主键
   */
  id?: number | string;

  /**
   * 配置类型
   */
  category?: string;

  /**
   * 配置名称
   */
  configName?: string;

  /**
   * 配置值
   */
  configValue?: string;

  /**
   * 说明
   */
  configDict?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 更新IP
   */
  updateIp?: string;
}

export interface ConfigQuery extends PageQuery {
  /**
   * 配置类型
   */
  category?: string;

  /**
   * 配置名称
   */
  configName?: string;

  /**
   * 配置值
   */
  configValue?: string;

  /**
   * 说明
   */
  configDict?: string;

  /**
   * 更新IP
   */
  updateIp?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
