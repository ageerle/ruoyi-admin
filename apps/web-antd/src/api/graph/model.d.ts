/**
 * 知识图谱相关类型定义
 */

// 图谱实例
export interface GraphInstance {
  id?: string;
  instanceName: string;
  knowledgeId: string;
  knowledgeName?: string;
  modelName?: string;
  status?: string; // NOT_BUILT, BUILDING, COMPLETED, FAILED
  nodeCount?: number;
  edgeCount?: number;
  entityTypes?: string;
  relationTypes?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

// 图谱构建任务
export interface GraphBuildTask {
  id?: string;
  instanceId?: string;
  taskType?: string; // FULL_BUILD, INCREMENTAL_BUILD, DOCUMENT_BUILD
  status?: string; // PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
  taskStatus?: number; // 任务状态码（后端枚举值）
  graphStatus?: number; // 图谱状态码（后端枚举值）
  progress?: number;
  totalDocuments?: number;
  processedDocuments?: number;
  nodeCount?: number;
  relationshipCount?: number;
  errorMessage?: string;
  startTime?: string;
  endTime?: string;
  createTime?: string;
}

// 图谱节点
export interface GraphNode {
  id?: string;
  nodeId: string;
  name: string;
  label: string; // 实体类型
  description?: string;
  confidence?: number;
  properties?: string; // JSON字符串
  knowledgeId?: string;
}

// 图谱边
export interface GraphEdge {
  id?: string;
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string; // 关系类型
  confidence?: number;
  weight?: number;
  properties?: string; // JSON字符串
  knowledgeId?: string;
}

// 图谱数据
export interface GraphData {
  vertices: GraphNode[];
  edges: GraphEdge[];
}

// 图谱统计
export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
}

// 实体抽取结果
export interface ExtractedEntity {
  name: string;
  type: string;
  description?: string;
}

export interface ExtractedRelation {
  source: string;
  target: string;
  type: string;
  description?: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
}

// 图谱检索结果
export interface GraphRetrievalResult {
  content: string;
  relevantEntities: GraphNode[];
  relevantRelations: GraphEdge[];
}

// 路径查询结果
export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  length: number;
}

// 邻居查询参数
export interface NeighborQueryParams {
  nodeId: string;
  knowledgeId: string;
  depth?: number;
}

// 路径查询参数
export interface PathQueryParams {
  startNodeId: string;
  endNodeId: string;
  knowledgeId: string;
  maxDepth?: number;
}

// 搜索参数
export interface SearchParams {
  keyword: string;
  knowledgeId: string;
  limit?: number;
}

// 实体抽取参数
export interface ExtractParams {
  text: string;
  modelName?: string;
}

// 文本入库参数
export interface IngestParams {
  text: string;
  knowledgeId: string;
  modelName?: string;
  metadata?: Record<string, any>;
}

// 检索参数
export interface RetrieveParams {
  query: string;
  knowledgeId: string;
  topK?: number;
}

// 图谱实例表单
export interface GraphInstanceForm {
  id?: string;
  instanceName: string;
  knowledgeId: string;
  modelName?: string;
  entityTypes?: string[];
  relationTypes?: string[];
  remark?: string;
}

