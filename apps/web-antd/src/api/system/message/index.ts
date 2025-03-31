import type { MessageForm, MessageQuery, MessageVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询聊天消息列表
 * @param params
 * @returns 聊天消息列表
 */
export function messageList(params?: MessageQuery) {
  return requestClient.get<PageResult<MessageVO>>('/system/message/list', {
    params,
  });
}

/**
 * 导出聊天消息列表
 * @param params
 * @returns 聊天消息列表
 */
export function messageExport(params?: MessageQuery) {
  return commonExport('/system/message/export', params ?? {});
}

/**
 * 查询聊天消息详情
 * @param id id
 * @returns 聊天消息详情
 */
export function messageInfo(id: ID) {
  return requestClient.get<MessageVO>(`/system/message/${id}`);
}

/**
 * 新增聊天消息
 * @param data
 * @returns void
 */
export function messageAdd(data: MessageForm) {
  return requestClient.postWithMsg<void>('/system/message', data);
}

/**
 * 更新聊天消息
 * @param data
 * @returns void
 */
export function messageUpdate(data: MessageForm) {
  return requestClient.putWithMsg<void>('/system/message', data);
}

/**
 * 删除聊天消息
 * @param id id
 * @returns void
 */
export function messageRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/message/${id}`);
}
