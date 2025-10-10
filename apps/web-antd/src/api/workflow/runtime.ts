// 运行时相关接口（提供注入能力，避免与应用层 API 耦合）

export interface WorkflowRunParams {
  options: { uuid: string; inputs: any[] }
  signal?: AbortSignal
  startCallback?: (wfRuntimeJson: string) => void
  thinkingDataReceived?: (chunk: string) => void
  messageReceived?: (chunk: string, event?: string) => void
  doneCallback?: (finalChunk: string) => void
  errorCallback?: (error: string) => void
}

export interface WorkflowResumeParams {
  runtimeUuid: string
  feedbackContent: string
}

let workflowRunImpl: ((p: WorkflowRunParams) => Promise<void>) | null = null
let workflowResumeImpl: ((p: WorkflowResumeParams) => Promise<void>) | null = null

export function setWorkflowRunImpl(fn: (p: WorkflowRunParams) => Promise<void>) {
  workflowRunImpl = fn
}

export function setWorkflowResumeImpl(fn: (p: WorkflowResumeParams) => Promise<void>) {
  workflowResumeImpl = fn
}

export async function workflowRun(p: WorkflowRunParams) {
  if (!workflowRunImpl) throw new Error('[workflow-designer] 未注入 workflowRun 实现')
  return workflowRunImpl(p)
}

export async function workflowRuntimeResume(p: WorkflowResumeParams) {
  if (!workflowResumeImpl) throw new Error('[workflow-designer] 未注入 workflowRuntimeResume 实现')
  return workflowResumeImpl(p)
}

let uploadAction = '/api/file/upload'
export function setUploadAction(url: string) { uploadAction = url }
export function getUploadAction() { return uploadAction }


