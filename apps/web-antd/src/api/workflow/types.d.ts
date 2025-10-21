declare namespace Workflow {
  interface WorkflowUpdateReq {
    uuid: string
    title: string
    remark: string
    isPublic: boolean
    nodes: any[]
    edges: any[]
  }

  interface WorkflowInfo {
    uuid: string
    title: string
    remark: string
    isPublic: boolean
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
  }

  interface WorkflowNode {
    uuid: string
    title: string
    workflowUuid: string
    wfComponent: WorkflowComponent
    inputConfig: any
    nodeConfig: any
    outputConfig: any
    positionX: number
    positionY: number
  }

  interface WorkflowEdge {
    id?: string
    uuid: string
    workflowUuid: string
    sourceNodeUuid: string
    sourceHandle?: string
    targetNodeUuid: string
  }

  interface WorkflowComponent {
    name: string
    title: string
    remark?: string
    isEnable?: boolean
  }

  interface WorkflowRuntime {
    uuid: string
    workflowUuid: string
    status: string
    createTime: string
    updateTime: string
  }

  interface WorkflowRuntimeNode {
    uuid: string
    runtimeUuid: string
    nodeUuid: string
    status: string
    inputData: any
    outputData: any
    errorMessage?: string
  }
}
