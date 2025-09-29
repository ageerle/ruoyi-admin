import { v4 as uuidv4 } from 'uuid'
import type { WorkflowInfo, WorkflowNode, WorkflowEdge, WorkflowComponent, UIWorkflow } from '../types/index.d'

export function emptyWorkflowInfo(): WorkflowInfo {
  return {
    uuid: 'default',
    title: '',
    nodes: [],
    edges: [],
    deleteNodes: [],
    deleteEdges: [],
  }
}

export function emptyWorkflowNode(): WorkflowNode {
  return {
    uuid: uuidv4().replace(/-/g, ''),
    title: '',
    workflowUuid: 'default',
    wfComponent: { name: 'Start', title: '开始' },
    inputConfig: { user_inputs: [], ref_inputs: [] },
    nodeConfig: {},
    outputConfig: {},
    positionX: 0,
    positionY: 0,
  }
}

export function createNewNode(
  workflow: WorkflowInfo,
  uiWorkflow: UIWorkflow,
  component: WorkflowComponent,
  position: { x: number; y: number },
) {
  const newWfNode = emptyWorkflowNode()
  newWfNode.uuid = uuidv4().replace(/-/g, '')
  newWfNode.title = component.title
  newWfNode.workflowUuid = workflow.uuid
  newWfNode.wfComponent = component
  newWfNode.inputConfig = { user_inputs: [], ref_inputs: [] }
  newWfNode.nodeConfig = {}
  newWfNode.outputConfig = {}
  newWfNode.positionX = position.x
  newWfNode.positionY = position.y

  workflow.nodes.push(newWfNode)
  uiWorkflow.nodes.push(wfNodeToUiNode(newWfNode))
}

export function createNewEdge(params: {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  source: string
  sourceHandle: string
  target: string
}) {
  const wfEdge: WorkflowEdge = {
    id: '',
    uuid: uuidv4().replace(/-/g, ''),
    workflowUuid: params.workflow.uuid,
    sourceNodeUuid: params.source,
    sourceHandle: params.sourceHandle,
    targetNodeUuid: params.target,
  }
  params.workflow.edges.push(wfEdge)
  if (params.target) {
    const uiEdge = {
      id: wfEdge.uuid,
      source: wfEdge.sourceNodeUuid,
      target: wfEdge.targetNodeUuid,
      type: 'special',
      animated: true,
      sourceHandle: params.sourceHandle ? params.sourceHandle : undefined,
      data: wfEdge,
    }
    params.uiWorkflow.edges.push(uiEdge)
  }
}

function wfNodeToUiNode(node: WorkflowNode) {
  return {
    id: node.uuid,
    type: node.wfComponent.name.toLowerCase(),
    data: node,
    position: { x: node.positionX, y: node.positionY },
  }
}

export function getNameByInputType(type: number) {
  switch (type) {
    case 1: return '文本'
    case 2: return '数字'
    case 3: return '下拉选项'
    case 4: return '文件列表'
    default: return 'Unknown'
  }
}

export function getIconByComponentName(name: string) {
  switch (name.toLowerCase()) {
    case 'answer': return 'carbon:question-answering'
    case 'classifier': return 'carbon:type-pattern'
    case 'knowledgeretrieval': return 'carbon:connect-target'
    case 'documentextractor': return 'carbon:ibm-knowledge-catalog-standard'
    case 'keywordextractor': return 'carbon:api-key'
    case 'faqextractor': return 'fluent-mdl2:book-answers'
    case 'switcher': return 'oui:logstash-if'
    case 'template': return 'carbon:prompt-template'
    case 'dalle3': return 'solar:pallete-2-linear'
    case 'tongyiwanx': return 'solar:pallete-2-linear'
    case 'google': return 'ri:google-line'
    case 'humanfeedback': return 'covid:transmission-virus-human-transmit-2'
    case 'mailsend': return 'carbon:mail-all'
    case 'httprequest': return 'carbon:http'
    case 'end': return 'carbon:closed-caption'
    case 'start': return 'carbon:play-outline'
    default: return ''
  }
}

export function getIconClassByComponentName(name: string) {
  switch (name.toLowerCase()) {
    case 'answer': return 'text-green-800'
    case 'classifier': return 'text-violet-900'
    case 'knowledgeretrieval': return 'text-stone-900'
    case 'documentextractor': return 'text-rose-900'
    case 'keywordextractor': return 'text-cyan-900'
    case 'faqextractor': return 'text-teal-600'
    case 'switcher': return 'text-yellow-900'
    case 'template': return 'text-sky-800'
    case 'dalle3': return 'text-fuchsia-700'
    case 'tongyiwanx': return 'text-fuchsia-700'
    case 'google': return 'text-emerald-900'
    case 'humanfeedback': return 'text-zinc-800'
    case 'mailsend': return 'text-amber-800'
    case 'httprequest': return 'text-slate-800'
    case 'end': return 'text-orange-800'
    case 'start': return 'text-blue-900'
    default: return ''
  }
}


