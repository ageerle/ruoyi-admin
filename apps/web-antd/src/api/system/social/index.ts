import type { SocialInfo } from './model';

import { requestClient } from '#/api/request';

enum Api {
  root = '/system/social',
  socialList = '/system/social/list',
}

/**
 * 获取绑定的社交信息列表
 * @returns info
 */
export function socialList() {
  return requestClient.get<SocialInfo[]>(Api.socialList);
}

export function socialInfo(id: number | string) {
  return requestClient.get(`${Api.root}/${id}`);
}
