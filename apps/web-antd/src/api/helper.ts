import { isObject, isString } from '@vben/utils';

import { requestClient } from './request';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T,
): T extends true ? string : object;

export function joinTimestamp(join: boolean, restful = false): object | string {
  if (!join) {
    return restful ? '' : {};
  }
  const now = Date.now();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/**
 * @description: Format request parameter time
 */
export function formatRequestDate(params: Record<string, any>) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  for (const key in params) {
    const format = params[key]?.format ?? null;
    if (format && typeof format === 'function') {
      params[key] = params[key].format(DATE_TIME_FORMAT);
    }
    if (isString(key)) {
      const value = params[key];
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value;
        } catch (error: any) {
          throw new Error(error);
        }
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}

/**
 * Add the object as a parameter to the URL
 * @param baseUrl url
 * @param obj
 * @returns {string}
 * eg:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl)
    ? baseUrl + parameters
    : baseUrl.replace(/\/?$/, '?') + parameters;
}

/**
 * @description:  contentType
 */
export enum ContentTypeEnum {
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // json
  JSON = 'application/json;charset=UTF-8',
}

/**
 * 通用下载接口 封装一层
 * @param url 请求地址
 * @param data  请求参数
 * @returns blob二进制
 */
export function commonExport(url: string, data: Record<string, any>) {
  return requestClient.post<Blob>(url, data, {
    data,
    headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
    isTransformResponse: false,
    responseType: 'blob',
  });
}
