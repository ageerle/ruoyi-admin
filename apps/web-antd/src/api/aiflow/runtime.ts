// 运行时相关接口（提供注入能力，避免与应用层 API 耦合）
import { adapters } from './adapters'
import { useAccessStore } from '@vben/stores'

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
  if (!workflowRunImpl) {
    // 默认回退到真实接口（后端改为 body 传 uuid/inputs，URL 不再携带 uuid）
    return commonSseProcess(`/api/workflow/run`, {
      options: p.options,
      signal: p.signal,
      startCallback: p.startCallback || (() => {}),
      messageReceived: p.messageReceived || (() => {}),
      thinkingDataReceived: p.thinkingDataReceived || (() => {}),
      doneCallback: p.doneCallback || (() => {}),
      errorCallback: p.errorCallback || (() => {}),
    })
  }
  return workflowRunImpl(p)
}

export async function workflowRuntimeResume(p: WorkflowResumeParams) {
  if (!workflowResumeImpl) {
    return adapters.httpPost(`/workflow/runtime/resume/${p.runtimeUuid}`, { ...p })
  }
  return workflowResumeImpl(p)
}

let uploadAction = '/api/file/upload'
export function setUploadAction(url: string) { uploadAction = url }
export function getUploadAction() { return uploadAction }

// 标准化的 SSE 运行器（不包含任何权限处理）
export async function commonSseProcess(
  url: string,
  params: {
    options: any
    signal?: AbortSignal
    startCallback: (chunk: string) => void
    thinkingDataReceived: (chunk: string) => void
    messageReceived: (chunk: string, eventName: string) => void
    audioDataReceived?: (chunk: string) => void
    stateChanged?: (state: string) => void
    doneCallback: (chunk: string) => void
    errorCallback: (error: string) => void
  },
) {
  try {
    // 使用项目的请求客户端来获取正确的配置
    const accessStore = useAccessStore()
    const token = accessStore.accessToken ? `Bearer ${accessStore.accessToken}` : ''
    
    console.log('SSE 请求配置:', {
      url,
      token: token ? '已设置' : '未设置',
      options: params.options
    })
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token,
        'Accept-Language': 'zh_CN',
        'Content-Language': 'zh_CN',
        'clientId': 'web'
      },
      body: JSON.stringify({ ...params.options }),
      signal: params.signal,
    })
    
    console.log('SSE 响应状态:', {
      status: res.status,
      statusText: res.statusText,
      contentType: res.headers.get('content-type'),
      ok: res.ok
    })
    
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok || !contentType.includes('text/event-stream')) {
      throw new Error(`SSE open failed: ${res.status} ${res.statusText}`)
    }

    const reader = res.body?.getReader()
    if (!reader) { throw new Error('ReadableStream not supported') }
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // 按事件块分割（以空行分隔）
      const parts = buffer.split('\n\n')
      // 最后一段可能是不完整，保留在 buffer
      buffer = parts.pop() || ''
      for (const part of parts) {
        // 解析 sse 行：event: xxx / data: yyy
        const lines = part.split('\n')
        let eventName = ''
        const dataLines: string[] = []
        for (const line of lines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim()
          else if (line.startsWith('data:')) dataLines.push(line.slice(5))
        }
        let data = dataLines.join('\n')
        if (data.indexOf('-_wrap_-') === 0) data = data.replace('-_wrap_-', '\n')

        // 分发内置事件
        if (eventName === '[START]') { params.startCallback(data); continue }
        if (eventName === '[ERROR]') { params.errorCallback(data); continue }
        if (eventName === '[DONE]') { params.doneCallback(data); continue }
        if (eventName === '[AUDIO]') { params.audioDataReceived && params.audioDataReceived(data); continue }
        if (eventName === '[THINKING]') { params.thinkingDataReceived && params.thinkingDataReceived(data); continue }
        if (eventName === '[STATE_CHANGED]') { params.stateChanged && params.stateChanged(data); continue }
        params.messageReceived(data, eventName)
      }
    }
  } catch (e: any) {
    params.errorCallback(e?.message || String(e))
    throw e
  }
}

// 运行记录相关
export function workflowRuntimes<T = any>(wfUuid: string, currentPage: number, pageSize: number) {
  return adapters.httpGet<T>(`/workflow/runtime/page?wfUuid=${wfUuid}&currentPage=${currentPage}&pageSize=${pageSize}`)
}

export function workflowRuntimeNodes<T = any>(wfRuntimeUuid: string) {
  return adapters.httpGet<T>(`/workflow/runtime/nodes/${wfRuntimeUuid}`)
}

export function workflowRuntimesClear<T = any>() {
  return adapters.httpPost<T>('/workflow/runtime/clear')
}

export function workflowRuntimeDelete<T = any>(uuid: string) {
  return adapters.httpPost<T>(`/workflow/runtime/del/${uuid}`)
}

