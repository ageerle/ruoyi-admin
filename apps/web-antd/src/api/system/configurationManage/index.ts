import { requestClient } from '#/api/request';

enum Api {
  addConfig = '/chat/config/add',
  listConfig = '/chat/config/list',
  updateConfig = '/system/config',
}

export function listConfig() {
  return requestClient.get<any>(Api.listConfig);
}

export function updateConfig(data: any) {
  return requestClient.put<any>(Api.updateConfig, data);
}

export function addConfig(data: any) {
  return requestClient.post<any>(Api.addConfig, data);
}
