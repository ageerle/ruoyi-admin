import type { Spel } from './model';

import type { ID, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

export function spelList(params?: PageQuery) {
  return requestClient.get<PageResult<Spel>>('/workflow/spel/list', { params });
}

export function spelInfo(id: ID) {
  return requestClient.get<Spel>(`/workflow/spel/${id}`);
}

export function spelAdd(data: Partial<Spel>) {
  return requestClient.postWithMsg<Spel>('/workflow/spel', data);
}

export function spelUpdate(data: Partial<Spel>) {
  return requestClient.putWithMsg<Spel>('/workflow/spel', data);
}

export function spelDelete(ids: ID[]) {
  return requestClient.deleteWithMsg<Spel>(`/workflow/spel/${ids}`);
}
