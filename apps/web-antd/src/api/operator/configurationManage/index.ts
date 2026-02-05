import { requestClient } from '#/api/request';

enum Api {
  addConfig = '/chat/config/saveOrUpdate',
  listConfig = '/chat/config/list',
}

export function listConfig() {
  return requestClient.get<any>(Api.listConfig);
}

export function addConfig(data: any) {
  return requestClient.post<any>(Api.addConfig, data);
}
