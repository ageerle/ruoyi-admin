import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import {ConfigForm, ConfigQuery, ConfigVO} from '@/api/system/chatconfig/types';

/**
 * 查询配置信息列表
 * @param query
 * @returns {*}
 */

export const listConfig = (query: { category: string; }): AxiosPromise<ConfigVO[]> => {
  return request({
    url: '/chat/config/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询配置信息详细
 * @param id
 */
export const getConfig = (id: string | number): AxiosPromise<ConfigVO> => {
  return request({
    url: '/system/config/' + id,
    method: 'get'
  });
};

/**
 * 新增对话配置信息

 * @param data
 */
export const addConfig = (data: any) => {
  return request({
    url: '/chat/config/add',
    method: 'post',
    data: data
  });
};

/**
 * 修改对话配置信息

 * @param data
 */
export const updateConfig = (data: ConfigForm) => {
  return request({
    url: '/system/config',
    method: 'put',
    data: data
  });
};

/**
 * 删除对话配置信息

 * @param id
 */
export const delConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/config/' + id,
    method: 'delete'
  });
};
