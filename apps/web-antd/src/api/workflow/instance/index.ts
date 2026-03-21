import type { TaskInfo } from '../task/model';
import type { FlowInfoResponse, FlowInstanceVariableResp } from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { requestClient } from '#/api/request';

/**
 * @param businessId 业务ID
 * @returns TaskInfo
 */
export function getTaskByBusinessId(businessId: string) {
  return requestClient.get<TaskInfo>(
    `/workflow/instance/getInfo/${businessId}`,
  );
}

/**
 * 分页查询正在运行的流程实例
 * @param params
 * @returns
 */
export function pageByRunning(params?: PageQuery) {
  return requestClient.get('/workflow/instance/pageByRunning', { params });
}

/**
 * pageByFinish
 * @param params
 * @returns
 */
export function pageByFinish(params?: PageQuery) {
  return requestClient.get('/workflow/instance/pageByFinish', { params });
}

/**
 * 按照业务id删除流程实例
 * @param businessIds 业务id
 */
export function deleteByBusinessIds(businessIds: IDS) {
  return requestClient.deleteWithMsg<void>(
    `/workflow/instance/deleteByBusinessIds${businessIds}`,
  );
}

/**
 * 按照实例id删除流程实例
 * @param instanceIds 实例id
 */
export function deleteByInstanceIds(instanceIds: IDS) {
  return requestClient.deleteWithMsg<void>(
    `/workflow/instance/deleteByInstanceIds/${instanceIds}`,
  );
}

/**
 * 撤销流程
 * @param data
 */
export function cancelProcessApply(data: { businessId: ID; message?: string }) {
  return requestClient.putWithMsg<void>(
    '/workflow/instance/cancelProcessApply',
    data,
  );
}

/**
 * 激活/挂起流程实例
 * @param instanceId
 * @param active
 */
export function workflowInstanceActive(instanceId: ID, active: boolean) {
  return requestClient.putWithMsg<void>(
    `/workflow/instance/active/${instanceId}?active=${active}`,
  );
}

/**
 * 获取当前登录人发起的流程实例
 * @param params
 * @returns PageResult<Flow>
 */
export function pageByCurrent(params?: PageQuery) {
  return requestClient.get<PageResult<TaskInfo>>(
    '/workflow/instance/pageByCurrent',
    { params },
  );
}

/**
 * 获取流程图，流程记录
 * @param businessId 业务标识
 * @returns 流程图，流程记录
 */
export function flowInfo(businessId: string) {
  return requestClient.get<FlowInfoResponse>(
    `/workflow/instance/flowHisTaskList/${businessId}`,
  );
}

/**
 * 获取流程变量
 * @param instanceId
 * @returns Map<string,any>
 */
export function instanceVariable(instanceId: string) {
  return requestClient.get<FlowInstanceVariableResp>(
    `/workflow/instance/instanceVariable/${instanceId}`,
  );
}

/**
 * 作废流程
 */
export function workflowInstanceInvalid(data: {
  comment?: string;
  id: string;
}) {
  return requestClient.postWithMsg<void>('/workflow/instance/invalid', data);
}

/**
 * 修改流程参数
 * @param data 参数
 * @param data.instanceId 实例ID
 * @param data.key 参数key
 * @param data.value 值
 * @returns void
 */
export function updateFlowVariable(data: {
  instanceId: string;
  key: string;
  value: any;
}) {
  return requestClient.putWithMsg<void>(
    '/workflow/instance/updateVariable',
    data,
  );
}
