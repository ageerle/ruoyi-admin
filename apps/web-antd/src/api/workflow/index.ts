import { adapters } from './adapters'

export const workflowApi = {
  workflowAdd<T = any>(data: { title: string; remark: string; isPublic: boolean }) {
    return adapters.httpPost<T>('/workflow/add', data)
  },

  workflowCopy<T = any>(wfUuid: string) {
    return adapters.httpPost<T>(`/workflow/copy/${wfUuid}`)
  },

  workflowUpdate<T = any>(data: Workflow.WorkflowUpdateReq) {
    return adapters.httpPost<T>('/workflow/update', data)
  },

  workflowDel<T = any>(uuid: string) {
    return adapters.httpPost<T>(`/workflow/del/${uuid}`)
  },

  workflowSetPublic<T = any>(uuid: string, isPublic?: boolean) {
    return adapters.httpPost<T>(`/workflow/set-public/${uuid}?isPublic=${isPublic}`)
  },

  workflowBaseInfoUpdate<T = any>(data: { uuid: string; title: string; remark: string; isPublic: boolean }) {
    return adapters.httpPost<T>('/workflow/base-info/update', data)
  },

  workflowGet<T = any>(uuid: string) {
    return adapters.httpGet<T>(`/workflow/${uuid}`)
  },

  workflowPage<T = any>(params: { 
    currentPage: number; 
    pageSize: number; 
    wfSearchReq: { 
      title?: string; 
      isEnable?: boolean; 
      isPublic?: boolean; 
    } 
  }) {
    const { currentPage, pageSize, wfSearchReq } = params
    return adapters.httpPost<T>('/admin/workflow/search', wfSearchReq, {
      params: { currentPage, pageSize }
    })
  },

  workflowComponents<T = any>() {
    return adapters.httpGet<T>('/workflow/public/component/list')
  },

  workflowSearchMine<T = any>(keyword: string, currentPage: number, pageSize: number) {
    const search = keyword === undefined ? '' : `keyword=${keyword}&`
    return adapters.httpGet<T>(`/workflow/mine/search?${search}currentPage=${currentPage}&pageSize=${pageSize}`)
  },

  workflowSearchPublic<T = any>(keyword: string, currentPage: number, pageSize: number) {
    const search = keyword === undefined ? '' : `keyword=${keyword}&`
    return adapters.httpGet<T>(`/workflow/public/search?${search}currentPage=${currentPage}&pageSize=${pageSize}`)
  },

  workflowRuntimes<T = any>(wfUuid: string, currentPage: number, pageSize: number) {
    return adapters.httpGet<T>(`/workflow/runtime/page?wfUuid=${wfUuid}&currentPage=${currentPage}&pageSize=${pageSize}`)
  },

  workflowRuntimeNodes<T = any>(wfRuntimeUuid: string) {
    return adapters.httpGet<T>(`/workflow/runtime/nodes/${wfRuntimeUuid}`)
  },

  workflowRuntimesClear<T = any>() {
    return adapters.httpPost<T>('/workflow/runtime/clear')
  },

  workflowOperators<T = any>() {
    return adapters.httpGet<T>('/workflow/public/operators')
  },

  workflowRuntimeDelete<T = any>(wfRuntimeUuid: string) {
    return adapters.httpGet<T>(`/workflow/runtime/del/${wfRuntimeUuid}`)
  },

  workflowRuntimeResume<T = any>(params: {
    runtimeUuid: string
    feedbackContent: string
  }) {
    return adapters.httpPost<T>(`/workflow/runtime/resume/${params.runtimeUuid}`, { ...params })
  },
}

export default workflowApi

// 运行时能力透出（便于按包内其他接口形式统一从此处导出）
export * from './runtime'