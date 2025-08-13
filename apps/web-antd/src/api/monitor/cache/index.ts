import {requestClient} from '#/api/request';

export interface CommandStats {
  name: string;
  value: string;
}

export interface RedisInfo {
  [key: string]: string;
}

export interface CacheInfo {
  commandStats: CommandStats[];
  dbSize: number;
  info: RedisInfo;
}

/**
 *
 * @returns redis信息
 */
export function redisCacheInfo() {
  return requestClient.get<CacheInfo>('/monitor/cache');
}
