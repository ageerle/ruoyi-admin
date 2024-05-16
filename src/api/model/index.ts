import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import { ModelForm, ModelQuery, ModelNameVO } from '@/api/model/types';
/**
 * 查询系统模型列表
 * @param query
 * @returns {*}
 */

export const listModel = (query?: ModelQuery): AxiosPromise<ModelNameVO[]> => {
  return request({
    url: '/system/model/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统模型详细
 * @param id
 */
export const getModel = (id: string | number): AxiosPromise<ModelNameVO> => {
  return request({
    url: '/system/model/' + id,
    method: 'get'
  });
};

/**
 * 新增系统模型
 * @param data
 */
export const addModel = (data: ModelForm) => {
  return request({
    url: '/system/model',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统模型
 * @param data
 */
export const updateModel = (data: ModelForm) => {
  return request({
    url: '/system/model',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统模型
 * @param id
 */
export const delModel = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/model/' + id,
    method: 'delete'
  });
};

