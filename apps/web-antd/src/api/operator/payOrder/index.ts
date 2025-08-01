import type { PayOrderForm, PayOrderQuery, PayOrderVO } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

/**
 * 查询支付订单列表
 * @param params
 * @returns 支付订单列表
 */
export function payOrderList(params?: PayOrderQuery) {
  return requestClient.get<PageResult<PayOrderVO>>('/system/payOrder/list', {
    params,
  });
}

/**
 * 导出支付订单列表
 * @param params
 * @returns 支付订单列表
 */
export function payOrderExport(params?: PayOrderQuery) {
  return commonExport('/system/payOrder/export', params ?? {});
}

/**
 * 查询支付订单详情
 * @param id id
 * @returns 支付订单详情
 */
export function payOrderInfo(id: ID) {
  return requestClient.get<PayOrderVO>(`/system/payOrder/${id}`);
}

/**
 * 新增支付订单
 * @param data
 * @returns void
 */
export function payOrderAdd(data: PayOrderForm) {
  return requestClient.postWithMsg<void>('/system/payOrder', data);
}

/**
 * 更新支付订单
 * @param data
 * @returns void
 */
export function payOrderUpdate(data: PayOrderForm) {
  return requestClient.putWithMsg<void>('/system/payOrder', data);
}

/**
 * 删除支付订单
 * @param id id
 * @returns void
 */
export function payOrderRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/payOrder/${id}`);
}
