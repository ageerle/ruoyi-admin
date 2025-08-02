export interface KnowledgeRole {
  id: number;
  groupId: number;
  knowledgeIds?: string[]; // Comma-separated list of knowledge IDs
  name: string;
  createBy: string;
  createTime: string;
  updateBy?: any;
  updateTime?: any;
  remark: string;
}
