import type { OssConfig } from './model';

import type { ID, IDS, PageQuery } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  ossConfigChangeStatus = '/resource/oss/config/changeStatus',
  ossConfigList = '/resource/oss/config/list',
  root = '/resource/oss/config',
}

// 获取OSS配置列表
export function ossConfigList(params?: PageQuery) {
  return requestClient.get<OssConfig[]>(Api.ossConfigList, { params });
}

// 获取OSS配置的信息
export function ossConfigInfo(ossConfigId: ID) {
  return requestClient.get<OssConfig>(`${Api.root}/${ossConfigId}`);
}

// 添加新的OSS配置
export function ossConfigAdd(data: Partial<OssConfig>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

// 更新现有的OSS配置
export function ossConfigUpdate(data: Partial<OssConfig>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

// 删除OSS配置
export function ossConfigRemove(ossConfigIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ossConfigIds}`);
}

// 更改OSS配置的状态
export function ossConfigChangeStatus(data: any) {
  const requestData: Partial<OssConfig> = {
    ossConfigId: data.ossConfigId,
    status: data.status,
    configKey: data.configKey,
  };
  return requestClient.putWithMsg(Api.ossConfigChangeStatus, requestData);
}
