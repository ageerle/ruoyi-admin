import type { Post } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  postExport = '/system/post/export',
  postList = '/system/post/list',
  postSelect = '/system/post/optionselect',
  root = '/system/post',
}

/**
 * 获取岗位列表
 * @param params 参数
 * @returns Post[]
 */
export function postList(params?: PageQuery) {
  return requestClient.get<Post[]>(Api.postList, { params });
}

export function postExport(data: any) {
  return commonExport(Api.postExport, data);
}

export function postInfo(postId: ID) {
  return requestClient.get<Post>(`${Api.root}/${postId}`);
}

export function postAdd(data: any) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

export function postUpdate(data: any) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

export function postRemove(postIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${postIds}`);
}

export function postOptionSelect(deptId: ID) {
  return requestClient.get<Post[]>(Api.postSelect, { params: { deptId } });
}
