import type {VoucherForm, VoucherQuery, VoucherVO} from './model';

import type {ID, IDS, PageResult} from '#/api/common';

import {commonExport} from '#/api/helper';
import {requestClient} from '#/api/request';

/**
 * 查询用户兑换记录列表
 * @param params
 * @returns 用户兑换记录列表
 */
export function voucherList(params?: VoucherQuery) {
  return requestClient.get<PageResult<VoucherVO>>('/system/voucher/list', {
    params,
  });
}

/**
 * 导出用户兑换记录列表
 * @param params
 * @returns 用户兑换记录列表
 */
export function voucherExport(params?: VoucherQuery) {
  return commonExport('/system/voucher/export', params ?? {});
}

/**
 * 查询用户兑换记录详情
 * @param id id
 * @returns 用户兑换记录详情
 */
export function voucherInfo(id: ID) {
  return requestClient.get<VoucherVO>(`/system/voucher/${id}`);
}

/**
 * 新增用户兑换记录
 * @param data
 * @returns void
 */
export function voucherAdd(data: VoucherForm) {
  return requestClient.postWithMsg<void>('/system/voucher', data);
}

/**
 * 更新用户兑换记录
 * @param data
 * @returns void
 */
export function voucherUpdate(data: VoucherForm) {
  return requestClient.putWithMsg<void>('/system/voucher', data);
}

/**
 * 删除用户兑换记录
 * @param id id
 * @returns void
 */
export function voucherRemove(id: ID | IDS) {
  return requestClient.deleteWithMsg<void>(`/system/voucher/${id}`);
}
