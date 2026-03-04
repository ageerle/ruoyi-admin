import type { McpTool, McpToolTestResult } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  mcpToolTest = '/mcp/tool',
  mcpToolExport = '/mcp/tool/export',
  mcpToolList = '/mcp/tool/list',
  mcpToolAll = '/mcp/tool/all',
  root = '/mcp/tool',
}

/**
 * 查询MCP工具分页列表
 * @param params 请求参数
 * @returns 列表
 */
export function mcpToolList(params?: PageQuery) {
  return requestClient.get<PageResult<McpTool>>(Api.mcpToolList, { params });
}

/**
 * 查询所有MCP工具（不分页）
 * @returns 列表
 */
export function mcpToolAll() {
  return requestClient.get<McpTool[]>(Api.mcpToolAll);
}

/**
 * 导出MCP工具excel
 * @param data 请求参数
 */
export function mcpToolExport(data: Partial<McpTool>) {
  return commonExport(Api.mcpToolExport, data);
}

/**
 * MCP工具详情
 * @param id id
 * @returns 详情
 */
export function mcpToolInfo(id: ID) {
  return requestClient.get<McpTool>(`${Api.root}/${id}`);
}

/**
 * MCP工具新增
 * @param data 参数
 */
export function mcpToolAdd(data: Partial<McpTool>) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

/**
 * MCP工具修改
 * @param data 参数
 */
export function mcpToolUpdate(data: Partial<McpTool>) {
  return requestClient.putWithMsg<void>(Api.root, data);
}

/**
 * MCP工具状态修改
 * @param data 状态
 */
export function mcpToolChangeStatus(data: any) {
  return requestClient.putWithMsg<void>(
    `${Api.root}/${data.id}/status?status=${data.status}`,
  );
}

/**
 * MCP工具删除
 * @param ids id集合
 */
export function mcpToolRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/**
 * MCP工具测试
 * @param id 工具ID
 */
export function mcpToolTest(id: ID) {
  return requestClient.post<McpToolTestResult>(`${Api.root}/${id}/test`);
}
