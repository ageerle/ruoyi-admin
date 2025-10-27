import { requestClient } from '#/api/request';
import type { AihumanRealPublishInfo, AihumanRealPublishQueryParams, AihumanRealPublishListResponse } from './types';

/**
 * API路径枚举
 * 注意：aihumanRealPublish使用aihumanRealConfig的接口，但只筛选运行中(runStatus=1)的数据
 */
enum Api {
  // 列表接口使用aihumanRealConfig的list路径
  // 对应curl: http://192.168.101.105:5666/api/aihuman/aihumanRealConfig/list?runStatus=0
  configList = '/aihuman/aihumanRealConfig/list',
  // 详情接口使用aihumanRealConfig的root路径
  root = '/aihuman/aihumanRealConfig',
}

/**
 * 获取运行中的配置列表
 * 筛选runStatus为1的数据
 * 对应curl: http://192.168.101.105:5666/api/aihuman/aihumanRealConfig/list?runStatus=1
 */
export function aihumanRealPublishList(params: AihumanRealPublishQueryParams): Promise<AihumanRealPublishListResponse> {
  // 强制添加runStatus=1的条件，确保只获取运行中的配置
  const queryParams = { ...params, runStatus: 1 };
  return requestClient.get<AihumanRealPublishListResponse>(Api.configList, { params: queryParams });
}

/**
 * 获取单个运行中配置详情
 */
export function aihumanRealPublishInfo(id: number): Promise<AihumanRealPublishInfo> {
  return requestClient.get<AihumanRealPublishInfo>(`${Api.root}/${id}`);
}
