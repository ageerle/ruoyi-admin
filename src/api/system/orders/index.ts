import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import {OrdersForm, OrdersQuery, OrdersVO} from '@/api/system/orders/types';

/**
 * 查询支付订单列表
 * @param query
 * @returns {*}
 */

export const listOrders = (query?: OrdersQuery): AxiosPromise<OrdersVO[]> => {
  return request({
    url: '/system/orders/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询支付订单详细
 * @param id
 */
export const getOrders = (id: string | number): AxiosPromise<OrdersVO> => {
  return request({
    url: '/system/orders/' + id,
    method: 'get'
  });
};

/**
 * 新增支付订单
 * @param data
 */
export const addOrders = (data: OrdersForm) => {
  return request({
    url: '/system/orders',
    method: 'post',
    data: data
  });
};

/**
 * 修改支付订单
 * @param data
 */
export const updateOrders = (data: OrdersForm) => {
  return request({
    url: '/system/orders',
    method: 'put',
    data: data
  });
};

/**
 * 删除支付订单
 * @param id
 */
export const delOrders = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/orders/' + id,
    method: 'delete'
  });
};
