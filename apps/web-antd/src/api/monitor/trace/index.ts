import type { TraceDetail, TraceNode, TraceRun } from './model';

import type { PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  traceDetail = '/monitor/trace/detail',
  traceNodeList = '/monitor/trace/node/list',
  traceRunList = '/monitor/trace/run/list',
  traceRunRoot = '/monitor/trace/run',
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
 * Trace运行详情
 * @param traceId traceId
 */
export function traceRunInfo(traceId: string) {
  return requestClient.get<TraceRun>(`${Api.traceRunRoot}/${traceId}`);
}

/**
 * Trace节点列表
 * @param traceId traceId
 */
export function traceNodeList(traceId: string) {
  return requestClient.get<TraceNode[]>(`${Api.traceNodeList}/${traceId}`);
}

/**
 * Trace完整详情
 * @param traceId traceId
 */
export function traceDetail(traceId: string) {
  return requestClient.get<TraceDetail>(`${Api.traceDetail}/${traceId}`);
}
