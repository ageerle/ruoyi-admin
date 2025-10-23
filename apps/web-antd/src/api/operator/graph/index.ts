import { requestClient } from '#/api/request';
import type {
  ExtractParams,
  GraphData,
  GraphInstance,
  GraphStats,
  IngestParams,
  NeighborQueryParams,
  PathQueryParams,
  RetrieveParams,
  SearchParams,
  ExtractionResult,
  GraphRetrievalResult,
  GraphPath,
  GraphNode,
  GraphBuildTask,
} from './model';

/**
 * 知识图谱API接口
 */

// ==================== 图谱实例管理 ====================

/**
 * 获取图谱实例列表
 */
export function graphInstanceList(params?: any) {
  return requestClient.get<any>('/graph/instance/list', { params });
}

/**
 * 创建图谱实例
 */
export function graphInstanceAdd(data: Partial<GraphInstance>) {
  return requestClient.post<any>('/graph/instance', data);
}

/**
 * 更新图谱实例
 */
export function graphInstanceUpdate(data: Partial<GraphInstance>) {
  return requestClient.put<any>('/graph/instance', data);
}

/**
 * 删除图谱实例
 */
export function graphInstanceRemove(id: string | string[]) {
  if (Array.isArray(id)) {
    return requestClient.delete<any>('/graph/instance/batch', { data: { ids: id } });
  }
  return requestClient.delete<any>(`/graph/instance/${id}`);
}

/**
 * 获取图谱实例详情
 */
export function graphInstanceInfo(id: string) {
  return requestClient.get<GraphInstance>(`/graph/instance/${id}`);
}

/**
 * 构建图谱
 */
export function graphInstanceBuild(id: string) {
  return requestClient.post<any>(`/graph/instance/build/${id}`);
}

/**
 * 重建图谱
 */
export function graphInstanceRebuild(id: string) {
  return requestClient.post<any>(`/graph/instance/rebuild/${id}`);
}

/**
 * 获取构建状态
 */
export function graphInstanceStatus(id: string) {
  return requestClient.get<any>(`/graph/instance/status/${id}`);
}

/**
 * 导出图谱实例数据
 */
export function graphInstanceExport(params?: any) {
  return requestClient.post<Blob>('/graph/instance/export', params, {
    responseType: 'blob',
  });
}

// ==================== 图谱查询 ====================

/**
 * 获取知识库的图谱数据
 */
export function graphQueryByKnowledge(knowledgeId: string, limit?: number) {
  return requestClient.get<GraphData>(`/graph/query/knowledge/${knowledgeId}`, {
    params: { limit },
  });
}

/**
 * 搜索实体
 */
export function graphSearchEntity(params: SearchParams) {
  return requestClient.get<GraphNode[]>('/graph/query/search/entity', { params });  // ⭐ 修复路径
}

/**
 * 获取邻居节点
 */
export function graphGetNeighbors(params: NeighborQueryParams) {
  return requestClient.get<GraphData>('/graph/query/neighbors', { params });
}

/**
 * 查找路径
 */
export function graphFindPath(params: PathQueryParams) {
  return requestClient.get<GraphPath[]>('/graph/query/path', { params });
}

/**
 * 获取图谱统计信息
 */
export function graphGetStats(knowledgeId: string) {
  return requestClient.get<GraphStats>(`/graph/query/stats/${knowledgeId}`);
}

/**
 * 删除图谱数据
 */
export function graphDeleteData(knowledgeId: string) {
  return requestClient.delete<any>(`/graph/query/delete/${knowledgeId}`);
}

// ==================== 图谱RAG ====================

/**
 * 实体抽取
 */
export function graphExtractEntities(data: ExtractParams) {
  return requestClient.post<ExtractionResult>('/graph/query/extract', data);
}

/**
 * 文本入库
 */
export function graphIngestText(data: IngestParams) {
  return requestClient.post<ExtractionResult>('/graph/query/ingest', data);
}

/**
 * 图谱检索
 */
export function graphRetrieve(data: RetrieveParams) {
  return requestClient.post<GraphRetrievalResult>('/graph/query/retrieve', data);
}

