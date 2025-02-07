import type { OssFile } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { ContentTypeEnum } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  ossDownload = '/resource/oss/download',
  ossInfo = '/resource/oss/listByIds',
  ossList = '/resource/oss/list',
  ossUpload = '/resource/oss/upload',
  root = '/resource/oss',
}

export function ossList(params?: PageQuery) {
  return requestClient.get<PageResult<OssFile>>(Api.ossList, { params });
}

export function ossInfo(ossIds: IDS) {
  return requestClient.get<OssFile>(`${Api.ossInfo}/${ossIds}`);
}

/**
 * @deprecated
 * @param file 文件
 * @returns void
 */
export function ossUpload(file: any) {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.postWithMsg(Api.ossUpload, formData, {
    headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    timeout: 30 * 1000,
  });
}

/**
 * 下载文件  返回为二进制
 * @param ossId ossId
 * @returns blob
 */
export function ossDownload(ossId: ID) {
  return requestClient.get<Blob>(`${Api.ossDownload}/${ossId}`, {
    responseType: 'blob',
    timeout: 30 * 1000,
    isTransformResponse: false,
  });
}

export function ossRemove(ossIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ossIds}`);
}
