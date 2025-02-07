import { requestClient } from '#/api/request';

enum Api {
  listConfig = '/chat/config/list',
}

export function listConfig() {
  return requestClient.get<any>(Api.listConfig);
}
