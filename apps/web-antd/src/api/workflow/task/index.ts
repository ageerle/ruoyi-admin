import type {
  CompleteTaskReqData,
  NextNodeInfo,
  StartWorkFlowReqData,
  TaskInfo,
  TaskOperationData,
  TaskOperationType,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * 启动任务
 * @param data
 */
export function startWorkFlow(data: StartWorkFlowReqData) {
  return requestClient.post<{
    processInstanceId: string;
    taskId: string;
  }>('/workflow/task/startWorkFlow', data);
}

/**
 * 办理任务
 * @param data
 */
export function completeTask(data: CompleteTaskReqData) {
  return requestClient.postWithMsg<void>('/workflow/task/completeTask', data);
}

/**
 * 查询当前用户的待办任务
 * @param params
 */
export function pageByTaskWait(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/task/pageByTaskWait',
    { params },
  );
}

/**
 * 查询当前用户的已办任务
 * @param params
 */
export function pageByTaskFinish(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/task/pageByTaskFinish',
    { params },
  );
}

/**
 * 查询所有待办任务
 * @param params
 */
export function pageByAllTaskWait(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/task/pageByAllTaskWait',
    { params },
  );
}

/**
 * 查询已办任务
 * @param params
 */
export function pageByAllTaskFinish(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/task/pageByAllTaskFinish',
    { params },
  );
}

/**
 * 查询当前用户的抄送
 * @param params
 */
export function pageByTaskCopy(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/task/pageByTaskCopy',
    { params },
  );
}

/**
 * 根据taskId查询代表任务
 * @param taskId 任务id
 * @returns info
 */
export function getTaskByTaskId(taskId: string) {
  return requestClient.get<TaskInfo>(`/workflow/task/getTask/${taskId}`);
}

/**
 * 终止任务
 */
export function terminationTask(data: { comment?: string; taskId: string }) {
  return requestClient.postWithMsg<void>(
    '/workflow/task/terminationTask',
    data,
  );
}

/**
 * 任务操作
 * @param taskOperationData 参数
 * @param taskOperation 操作类型，委派 delegateTask、转办 transferTask、加签 addSignature、减签 reductionSignature
 */
export function taskOperation(
  taskOperationData: TaskOperationData,
  taskOperation: TaskOperationType,
) {
  return requestClient.postWithMsg<void>(
    `/workflow/task/taskOperation/${taskOperation}`,
    taskOperationData,
  );
}

/**
 * 修改任务办理人
 * @param taskIdList 任务id
 * @param userId 办理人id
 */
export function updateAssignee(taskIdList: IDS, userId: ID) {
  return requestClient.putWithMsg<void>(
    `/workflow/task/updateAssignee/${userId}`,
    taskIdList,
  );
}

/**
 * 驳回审批
 * @param data 参数
 */
export function backProcess(data: any) {
  return requestClient.postWithMsg<void>('/workflow/task/backProcess', data);
}

/**
 * 获取可驳回节点
 * @param definitionId 流程定义ID
 * @param nodeCode 当前节点编码
 */
export function getBackTaskNode(definitionId: string, nodeCode: string) {
  return requestClient.get<{ nodeCode: string; nodeName: string }[]>(
    `/workflow/task/getBackTaskNode/${definitionId}/${nodeCode}`,
  );
}

/**
 * 获取当前任务的所有办理人
 * @param taskId 任务id
 */
export function currentTaskAllUser(taskId: ID) {
  return requestClient.get<any>(`/workflow/task/currentTaskAllUser/${taskId}`);
}

/**
 * 获取下一节点
 * @param data data
 * @param data.taskId taskId
 * @returns NextNodeInfo
 */
export function getNextNodeList(data: { taskId: string }) {
  return requestClient.post<NextNodeInfo[]>(
    '/workflow/task/getNextNodeList',
    data,
  );
}
