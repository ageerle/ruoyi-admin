export interface TraceRun {
  traceId: string;
  traceName: string;
  businessType?: string;
  businessTypeLabel?: string;
  businessId?: string;
  status?: string;
  statusLabel?: string;
  durationMs?: number;
  startTime?: number | string;
  endTime?: number | string;
  errorMessage?: string;
  metadata?: any;
  parsedMetadata?: Record<string, any>;
}

export interface TraceNode {
  nodeId?: string;
  traceId?: string;
  parentNodeId?: string;
  parentId?: string;
  nodeName?: string;
  nodeDisplayName?: string;
  nodeType?: string;
  nodeTypeLabel?: string;
  status?: string;
  statusLabel?: string;
  durationMs?: number;
  startTime?: number | string;
  endTime?: number | string;
  inputPayload?: any;
  outputPayload?: any;
  metadata?: any;
  parsedInput?: Record<string, any>;
  parsedOutput?: Record<string, any>;
  parsedMetadata?: Record<string, any>;
  errorMessage?: string;
  depth?: number;
  className?: string;
  methodName?: string;
  children?: TraceNode[];
}

export interface TraceStatistics {
  totalNodes: number;
  successCount: number;
  failedCount: number;
  runningCount: number;
  maxDepth: number;
  avgDurationMs: number;
  totalDurationMs: number;
  topSlowNodes: SlowNodeInfo[];
}

export interface SlowNodeInfo {
  nodeId: string;
  nodeDisplayName: string;
  nodeTypeLabel: string;
  durationMs: number;
  percentOfTotal: number;
}

export interface TraceDetail {
  run?: TraceRun;
  nodes?: TraceNode[];
  nodeList?: TraceNode[];
  traceRun?: TraceRun;
  traceNodes?: TraceNode[];
  statistics?: TraceStatistics;
}
