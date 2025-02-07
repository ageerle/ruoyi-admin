import type { Notice } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  noticeList = '/system/notice/list',
  root = '/system/notice',
}

export function noticeList(params?: PageQuery) {
  return requestClient.get<Notice[]>(Api.noticeList, { params });
}

export function noticeInfo(noticeId: ID) {
  return requestClient.get<Notice>(`${Api.root}/${noticeId}`);
}

export function noticeAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function noticeUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function noticeRemove(noticeIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${noticeIds}`);
}
