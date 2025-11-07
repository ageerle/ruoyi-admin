import type { AihumanPublishInfo as AihumanPublish, AihumanPublishQueryParams as AihumanPublishQueryParam } from './types';

import type { ID, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  root = '/aihuman/aihumanConfig',
  publishedList = '/aihuman/aihumanConfig/publishedList',
  generateVoice = '/aihuman/volcengine/generate-voice-direct',
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

/**
 * 使用volcengine-tts生成语音
 * @param params 语音合成参数
 * @returns 音频数据
 */
export function generateVoiceWithVolcengine(params: {
  ENDPOINT: string;
  appId: string;
  accessToken: string;
  resourceId: string;
  voice: string;
  text: string;
  encoding: string;
}) {
  console.log('generateVoiceWithVolcengine called with params:', params);
  
  // 使用明确的配置，确保正确处理二进制响应
  return requestClient.post<ArrayBuffer>(Api.generateVoice, params, {
    responseType: 'arraybuffer',
    // 不进行响应转换，直接返回原始响应
    isTransformResponse: false,
    // 返回原生响应，这样可以正确获取二进制数据
    isReturnNativeResponse: true,
    // 明确指定内容类型
    headers: {
      'Content-Type': 'application/json'
    },
    // 增加超时时间到30秒，因为语音合成可能需要更长时间
    timeout: 30000,
    // 禁用默认的加密设置，避免可能的干扰
    encrypt: false
  });
}
