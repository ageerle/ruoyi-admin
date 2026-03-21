export interface McpMarket {
  id: number;
  name: string;
  url: string;
  description: string;
  authConfig: string;
  status: string;
  createTime: string;
  updateTime: string;
}

export interface McpMarketTool {
  id: number;
  marketId: number;
  toolName: string;
  toolDescription: string;
  toolVersion: string;
  toolMetadata: string;
  isLoaded: boolean;
  localToolId: number;
}

export interface McpMarketRefreshResult {
  success: boolean;
  message: string;
  addedCount: number;
  updatedCount: number;
}
