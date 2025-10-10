import { v4 as uuidv4 } from 'uuid'
import type { WorkflowInfo, WorkflowNode, WorkflowEdge, WorkflowComponent, UIWorkflow } from '../types/index.d'
import { propertyDefaultGetters } from '../properties/defaults'

function deepClone<T>(value: T): T {
  try { return structuredClone(value) } catch { return JSON.parse(JSON.stringify(value)) }
}

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
    uuid: createUuid(),
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

function createUuid() {
  return uuidv4().replace(/-/g, '')
}

// 默认配置：优先读取面板自定义导出，其次读取集中配置表，最后内置表
const propertyModules = import.meta.glob('../properties/*NodeProperty.vue', { eager: true }) as Record<string, any>
function toPropertyKey(path: string) {
  const file = path.substring(path.lastIndexOf('/') + 1)
  return file.replace(/NodeProperty\.vue$/, '').toLowerCase()
}
const propertySelfGetters: Record<string, (workflow: WorkflowInfo) => any> = {}
for (const [p, mod] of Object.entries(propertyModules)) {
  const key = toPropertyKey(p)
  const getter = (mod as any)?.getDefaultNodeConfig as ((wf: WorkflowInfo) => any) | undefined
  if (typeof getter === 'function') propertySelfGetters[key] = getter
}

function getDefaultNodeConfig(name: string, workflow: WorkflowInfo) {
  const key = (name || '').toLowerCase()
  // 1) 面板自身导出
  const selfGetter = propertySelfGetters[key]
  if (selfGetter) return selfGetter(workflow)
  // 2) 集中配置表
  const tableGetter = propertyDefaultGetters[key]
  if (tableGetter) return tableGetter(workflow)

  // 3) 内置简易默认表,可在defaults.ts中添加其他默认配置,不建议使用该内置配置表
  // const simpleDefaults: Record<string, any> = {
  //   start: { prologue: '' },
  //   end: { result: '' },
  //   answer: { prompt: '', model_name: '' },
  //   template: { content: '' },
  //   keywordextractor: { top_n: 5, model_name: '' },
  //   faqextractor: { top_n: 5, model_name: '' },
  //   knowledgeretrieval: { knowledge_base_uuid: '', knowledge_base_name: '', score: 0.6, top_n: 3, is_strict: true, default_response: '' },
  //   dalle3: { prompt: '', size: '1024x1024', quality: 'standard' },
  //   tongyiwanx: { model_name: '', prompt: '', size: '1024*1024', seed: -1 },
  //   google: { query: '', country: 'cn', language: 'zh-cn', top_n: 5 },
  //   humanfeedback: { tip: '' },
  //   mailsend: { sender_type: 1, cc_mails: '', to_mails: '', subject: '', content: '', smtp: { host: '', port: 465 }, sender: { name: '', mail: '', password: '' } },
  //   httprequest: { method: 'GET', url: '', content_type: 'text/plain', headers: [{ name: 'Accept', value: '*/*' }], params: [], text_body: '', json_body: {}, form_data_body: [], form_urlencoded_body: [], body: {}, timeout: 10, retry_times: 0, clear_html: false },
  //   classifier: { categories: [ { category_uuid: createUuid(), category_name: '', target_node_uuid: '' }, { category_uuid: createUuid(), category_name: '', target_node_uuid: '' } ] },
  // }

  // return simpleDefaults[key] ?? {}
}

export function createNewNode(
  workflow: WorkflowInfo,
  uiWorkflow: UIWorkflow,
  component: WorkflowComponent,
  position: { x: number; y: number },
) {
  const newWfNode = emptyWorkflowNode()
  newWfNode.uuid = createUuid()
  newWfNode.title = component.title
  newWfNode.workflowUuid = workflow.uuid
  newWfNode.wfComponent = component
  newWfNode.inputConfig = { user_inputs: [], ref_inputs: [] }
  // 使用映射初始化最小可用的 nodeConfig，特殊项（如 switcher）按需读取 workflow
  newWfNode.nodeConfig = deepClone(getDefaultNodeConfig(component.name, workflow) || {})
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

export function updateEdgeBySourceHandle(params: {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  source: string
  sourceHandle: string
  target: string
}) {
  const wfEdge = params.workflow.edges.find((item) => item.sourceHandle === params.sourceHandle)
  if (!wfEdge) return
  wfEdge.targetNodeUuid = params.target
  const idx = (params.uiWorkflow.edges as any[]).findIndex((item: any) => item.source === params.source && item.sourceHandle === params.sourceHandle)
  if (idx > -1) (params.uiWorkflow.edges as any[]).splice(idx, 1)
  const uiEdge = {
    id: wfEdge.uuid,
    source: wfEdge.sourceNodeUuid,
    target: wfEdge.targetNodeUuid,
    animated: true,
    sourceHandle: params.sourceHandle,
  }
  ;(params.uiWorkflow.edges as any[]).push(uiEdge)
}

export function deleteEdgesBySourceHandle(
  workflow: WorkflowInfo,
  uiWorkflow: UIWorkflow,
  source: string,
  sourceHandle: string,
) {
  const edgeIndex = workflow.edges.findIndex((edge) => {
    const hit = edge.sourceNodeUuid === source && edge.sourceHandle === sourceHandle
    if (hit && !workflow.deleteEdges) workflow.deleteEdges = []
    if (hit) workflow.deleteEdges!.push(edge.uuid)
    return hit
  })
  if (edgeIndex !== -1) workflow.edges.splice(edgeIndex, 1)
  const uiEdgeIndex = (uiWorkflow.edges as any[]).findIndex((edge: any) => edge.sourceNodeUuid === source && edge.sourceHandle === sourceHandle)
  if (uiEdgeIndex !== -1) (uiWorkflow.edges as any[]).splice(uiEdgeIndex, 1)
}

function wfNodeToUiNode(node: WorkflowNode) {
  return {
    id: node.uuid,
    type: node.wfComponent?.name.toLowerCase() ?? '',
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


