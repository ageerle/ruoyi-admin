export {};
/**
 * myself 我发起的
 * readonly 只读 只用于查看
 * approve 审批(我的待办)
 * admin 流程监控 - 待办任务使用
 */
export type ApprovalType = 'admin' | 'approve' | 'myself' | 'readonly';
