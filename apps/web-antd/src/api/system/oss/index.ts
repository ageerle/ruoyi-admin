import type { AxiosRequestConfig } from '@vben/request';

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

/**
 * 文件list
 * @param params 参数
 * @returns 分页
 */
export function ossList(params?: PageQuery) {
  return requestClient.get<PageResult<OssFile>>(Api.ossList, { params });
}

/**
 * 查询文件信息 返回为数组
 * @param ossIds id数组
 * @returns 信息数组
 */
export function ossInfo(ossIds: IDS) {
  return requestClient.get<OssFile[]>(`${Api.ossInfo}/${ossIds}`);
}

/**
 * @deprecated 使用apps/web-antd/src/api/core/upload.ts uploadApi方法
 * @param file 文件
 * @returns void
 */
export function ossUpload(file: Blob | File) {
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
 * @param onDownloadProgress 下载进度(可选)
 * @returns blob
 */
export function ossDownload(
  ossId: ID,
  onDownloadProgress?: AxiosRequestConfig['onDownloadProgress'],
) {
  return requestClient.get<Blob>(`${Api.ossDownload}/${ossId}`, {
    responseType: 'blob',
    timeout: 30 * 1000,
    isTransformResponse: false,
    onDownloadProgress,
  });
}

/**
 * 删除文件
 * @param ossIds id数组
 * @returns void
 */
export function ossRemove(ossIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ossIds}`);
}
