export interface WorkflowInfo {
  uuid: string
  title: string
  remark?: string
  userUuid?: string
  isPublic?: boolean
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  deleteNodes?: string[]
  deleteEdges?: string[]
}

export interface WorkflowComponent {
  name: string
  title: string
  remark?: string
  isEnable?: boolean
}

export interface NodeIODefinition {
  uuid: string
  type: number
  name: string
  title: string
  required: boolean
  multiple?: boolean
  limit?: number
}

export interface NodeIOConfig {
  user_inputs: NodeIODefinition[]
  ref_inputs: any[]
}

export interface WorkflowNode {
  uuid: string
  title: string
  workflowUuid: string
  wfComponent?: WorkflowComponent  // 可选，前端可能没有
  workflowComponentId: number      // 后端返回的组件ID
  inputConfig: NodeIOConfig
  nodeConfig: Record<string, any>
  outputConfig: Record<string, any>
  positionX: number
  positionY: number
}

export interface WorkflowEdge {
  id?: string
  uuid: string
  workflowUuid: string
  sourceNodeUuid: string
  sourceHandle?: string
  targetNodeUuid: string
}

export interface UIWorkflowNodePosition { x: number; y: number }

export interface UIWorkflow {
  nodes: any[]
  edges: any[]
}



