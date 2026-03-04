export interface McpTool {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  configJson: string;
  createTime: string;
  updateTime: string;
}

export interface McpToolTestResult {
  success: boolean;
  message: string;
  data?: any;
}
