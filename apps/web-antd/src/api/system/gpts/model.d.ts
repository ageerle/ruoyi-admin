import type {BaseEntity, PageQuery} from '#/api/common';

export interface GptsVO {
  /**
   * id
   */
  id: number | string;

  /**
   * gpts应用id
   */
  gid: number | string;

  /**
   * gpts应用名称
   */
  name: string;

  /**
   * gpts图标
   */
  logo: string;

  /**
   * gpts描述
   */
  info: string;

  /**
   * 作者id
   */
  authorId: number | string;

  /**
   * 作者名称
   */
  authorName: string;

  /**
   * 点赞
   */
  useCnt: number;

  /**
   * 差评
   */
  bad: number;

  /**
   * 类型
   */
  type: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 更新IP
   */
  updateIp: string;
}

export interface GptsForm extends BaseEntity {
  /**
   * id
   */
  id?: number | string;

  /**
   * gpts应用id
   */
  gid?: number | string;

  /**
   * gpts应用名称
   */
  name?: string;

  /**
   * gpts图标
   */
  logo?: string;

  /**
   * gpts描述
   */
  info?: string;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 作者id
   */
  authorId?: number | string;

  /**
   * 作者名称
   */
  authorName?: string;

  /**
   * 点赞
   */
  useCnt?: number;

  /**
   * 差评
   */
  bad?: number;

  /**
   * 类型
   */
  type?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 系统角色定义
   */
  systemPrompt?: string;

  /**
   * 更新IP
   */
  updateIp?: string;
}

export interface GptsQuery extends PageQuery {
  /**
   * gpts应用id
   */
  gid?: number | string;

  /**
   * gpts应用名称
   */
  name?: string;

  /**
   * gpts图标
   */
  logo?: string;

  /**
   * gpts描述
   */
  info?: string;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 作者id
   */
  authorId?: number | string;

  /**
   * 作者名称
   */
  authorName?: string;

  /**
   * 点赞
   */
  useCnt?: number;

  /**
   * 差评
   */
  bad?: number;

  /**
   * 类型
   */
  type?: string;

  /**
   * 更新IP
   */
  updateIp?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
