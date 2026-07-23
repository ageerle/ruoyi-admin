import type { TraceDetail, TraceRun } from './model';

import type { PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  traceDetail = '/monitor/trace/detail',
  traceRunList = '/monitor/trace/run/list',
}

/**
 * Trace运行分页
 * @param params 查询参数
 * @returns 分页结果
 */
export function traceRunList(params?: PageQuery) {
  return requestClient.get<PageResult<TraceRun>>(Api.traceRunList, { params });
}

/**
 * Trace完整详情（含 run / nodes / statistics）
 * @param traceId traceId
 */
export function traceDetail(traceId: string) {
  return requestClient.get<TraceDetail>(`${Api.traceDetail}/${traceId}`);
}
