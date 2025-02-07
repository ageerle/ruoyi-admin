import type { Message } from './message';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  configExport = '/system/message/export',
  configList = '/system/message/list',
  root = '/system/message',
}

export function messageList(params?: PageQuery) {
  return requestClient.get<PageResult<Message>>(Api.configList, { params });
}

export function messageInfo(configId: ID) {
  return requestClient.get<Message>(`${Api.root}/${configId}`);
}


export function messageUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function messageAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function messageRemove(configIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${configIds}`);
}
