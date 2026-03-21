import type { McpMarket, McpMarketRefreshResult, McpMarketTool } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  mcpMarketExport = '/mcp/market/export',
  mcpMarketList = '/mcp/market/list',
  mcpMarketAll = '/mcp/market/all',
  root = '/mcp/market',
}

/**
 * 查询MCP市场分页列表
 * @param params 请求参数
 * @returns 列表
 */
export function mcpMarketList(params?: PageQuery) {
  return requestClient.get<PageResult<McpMarket>>(Api.mcpMarketList, { params });
}

/**
 * 查询所有MCP市场（不分页）
 * @returns 列表
 */
export function mcpMarketAll() {
  return requestClient.get<McpMarket[]>(Api.mcpMarketAll);
}

/**
 * 导出MCP市场excel
 * @param data 请求参数
 */
export function mcpMarketExport(data: Partial<McpMarket>) {
  return commonExport(Api.mcpMarketExport, data);
}

/**
 * MCP市场详情
 * @param id id
 * @returns 详情
 */
export function mcpMarketInfo(id: ID) {
  return requestClient.get<McpMarket>(`${Api.root}/${id}`);
}

/**
 * MCP市场新增
 * @param data 参数
 */
export function mcpMarketAdd(data: Partial<McpMarket>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * MCP市场修改
 * @param data 参数
 */
export function mcpMarketUpdate(data: Partial<McpMarket>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * MCP市场状态修改
 * @param data 状态
 */
export function mcpMarketChangeStatus(data: any) {
  return requestClient.putWithMsg<void>(
    `${Api.root}/${data.id}/status?status=${data.status}`,
  );
}

/**
 * MCP市场删除
 * @param ids id集合
 */
export function mcpMarketRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * 刷新市场工具列表
 * @param marketId 市场ID
 */
export function mcpMarketRefresh(marketId: ID) {
  return requestClient.postWithMsg<McpMarketRefreshResult>(`${Api.root}/${marketId}/refresh`);
}

/**
 * 加载单个工具到本地
 * @param toolId 工具ID
 */
export function mcpMarketLoadTool(toolId: ID) {
  return requestClient.postWithMsg<void>(`${Api.root}/tools/${toolId}/load`);
}

/**
 * 批量加载工具到本地
 * @param toolIds 工具ID列表
 */
export function mcpMarketBatchLoadTools(toolIds: ID[]) {
  return requestClient.postWithMsg<void>(`${Api.root}/tools/batch-load`, toolIds);
}

/**
 * 获取市场工具列表
 * @param marketId 市场ID
 */
export function mcpMarketToolList(marketId: ID) {
  return requestClient.get<McpMarketTool[]>(`${Api.root}/${marketId}/tools`);
}
