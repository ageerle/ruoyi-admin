import type { AihumanPublishInfo as AihumanPublish, AihumanPublishQueryParams as AihumanPublishQueryParam } from './types';

import type { ID, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  root = '/aihuman/aihumanConfig',
  publishedList = '/aihuman/aihumanConfig/publishedList',
}

/**
 * 获取已发布的交互数字人配置列表
 * @param params 查询参数
 * @returns AihumanPublish列表
 */
export function aihumanPublishList(params?: PageQuery & AihumanPublishQueryParam) {
  return requestClient.get<PageResult<AihumanPublish>>(Api.publishedList, { params });
}

/**
 * 获取已发布的交互数字人配置详情
 * @param id 配置ID
 * @returns AihumanPublish详情
 */
export function aihumanPublishInfo(id: ID) {
  return requestClient.get<AihumanPublish>(`${Api.root}/${id}`);
}
