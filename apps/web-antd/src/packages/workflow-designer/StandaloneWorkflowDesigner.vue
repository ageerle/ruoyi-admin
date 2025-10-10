<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, computed, provide, watch, markRaw } from 'vue'
import { NButton, NLayout, NLayoutContent, NLayoutSider, useMessage } from 'naive-ui'
import type { Edge, Node, NodeChange, EdgeChange, Connection, NodeMouseEvent } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import SvgIcon from './components/SvgIcon.vue'
import { createNewEdge, createNewNode, emptyWorkflowInfo, getIconByComponentName, getIconClassByComponentName } from './utils/workflow-util'
import type { WorkflowInfo, WorkflowComponent, WorkflowNode } from './types/index.d'
import RightPanel from './panels/RightPanel.vue'
import NodeShell from './components/nodes/NodeShell.vue'

interface Props {
  workflow: WorkflowInfo
  wfComponents: WorkflowComponent[]
  componentIdMap: Record<number, string>
}
const props = withDefaults(defineProps<Props>(), {
  workflow: () => emptyWorkflowInfo(),
  wfComponents: () => [],
  componentIdMap: () => ({}),
})

const emit = defineEmits<{
  (e: 'save', workflow: WorkflowInfo): void
  (e: 'run', payload: { workflow: WorkflowInfo }): void
  (e: 'deleteNode', nodeUuid: string): void
}>()

const ms = useMessage()
const submitting = ref<boolean>(false)
const hidePropertyPanel = ref<boolean>(true)
const selectedWfNode = ref<WorkflowNode>()
const { onInit, fitView, onConnect, onEdgesChange, onNodesChange, onNodeClick, onEdgeClick, onNodeDragStop, addSelectedNodes, project, getNodes } = useVueFlow()

const uw = { nodes: [] as Array<Node>, edges: [] as Array<Edge> }
const uiWorkflow = reactive(uw)

// 自动扫描并注册节点/边组件，未提供节点组件时回退到 NodeShell
const nodeModules = import.meta.glob('./components/nodes/*Node.vue', { eager: true, import: 'default' }) as Record<string, any>
const edgeModules = import.meta.glob('./components/edges/*Edge.vue', { eager: true, import: 'default' }) as Record<string, any>

function toKey(path: string, suffix: 'Node' | 'Edge') {
  const file = path.substring(path.lastIndexOf('/') + 1)
  return file.replace(new RegExp(`${suffix}\\.vue$`), '').toLowerCase()
}

const nodeTypes = computed(() => {
  const map: Record<string, any> = {}
  for (const [p, mod] of Object.entries(nodeModules)) {
    map[toKey(p, 'Node')] = markRaw(mod)
  }
  for (const c of props.wfComponents) {
    const key = c.name.toLowerCase()
    if (!map[key]) map[key] = markRaw(NodeShell)
  }
  return map
})

const edgeTypes = computed(() => {
  const map: Record<string, any> = {}
  for (const [p, mod] of Object.entries(edgeModules)) {
    map[toKey(p, 'Edge')] = markRaw(mod)
  }
  return map
})

function renderGraph() {
  console.log('开始渲染工作流:', props.workflow)
  console.log('节点数量:', props.workflow.nodes.length)
  console.log('边数量:', props.workflow.edges.length)
  
  const initX = 10, initY = 50
  const validNodeIds = new Set<string>()
  const newNodes: Array<any> = []
  const newEdges: Array<any> = []
  
  // 先渲染所有有效节点
  for (let i = 0; i < props.workflow.nodes.length; i++) {
    const node = props.workflow.nodes[i]
    console.log(`检查节点 ${i}:`, node)
    
    if (!node) {
      console.warn(`跳过节点 ${i}: 节点为空`)
      continue
    }
    
    if (!node.uuid) {
      console.warn(`跳过节点 ${i}: 缺少 uuid 字段`, node)
      continue
    }
    
    // 处理组件信息：后端可能只提供 workflowComponentId，需要映射到组件名称
    let componentName = ''
    if (node.wfComponent && node.wfComponent.name) {
      // 如果已经有 wfComponent.name，直接使用
      componentName = node.wfComponent.name
    } else if (node.workflowComponentId !== undefined) {
      // 使用调用方传入的组件ID映射
      componentName = props.componentIdMap[node.workflowComponentId] || 'Unknown'
      console.log(`根据 workflowComponentId ${node.workflowComponentId} 映射到组件: ${componentName}`)
    } else {
      console.warn(`跳过节点 ${i}: 无法确定组件类型`, node)
      continue
    }
    
    const px = node.positionX ? node.positionX : initX + 230 * i
    const py = node.positionY ? node.positionY : initY
    
    // 直接在原始节点对象上补齐 wfComponent，保持引用一致，确保属性修改能写回 workflow.nodes
    if (!node.wfComponent) {
      node.wfComponent = {
        name: componentName,
        title: componentName === 'Start' ? '开始' : componentName === 'End' ? '结束' : componentName,
        remark: componentName === 'Start' ? '工作流开始节点' : componentName === 'End' ? '工作流结束节点' : `${componentName}节点`
      }
    }

    newNodes.push({ id: node.uuid, type: componentName.toLowerCase(), data: node, position: { x: px, y: py } })
    validNodeIds.add(node.uuid)
    console.log(`✅ 添加节点: ${node.uuid} (${componentName})`)
  }
  
  console.log('有效节点ID:', Array.from(validNodeIds))
  
  // 只渲染有效的边（源节点和目标节点都存在）
  for (const wfEdge of props.workflow.edges) {
    if (!wfEdge || !wfEdge.uuid || !wfEdge.sourceNodeUuid || !wfEdge.targetNodeUuid) {
      console.warn('跳过无效边（缺少必要字段）:', wfEdge)
      continue
    }
    
    // 验证源节点和目标节点是否都存在
    if (validNodeIds.has(wfEdge.sourceNodeUuid) && validNodeIds.has(wfEdge.targetNodeUuid)) {
      newEdges.push({ 
        id: wfEdge.uuid, 
        source: wfEdge.sourceNodeUuid, 
        target: wfEdge.targetNodeUuid, 
        sourceHandle: wfEdge.sourceHandle, 
        type: 'special', 
        animated: true, 
        data: wfEdge 
      })
      console.log(`添加边: ${wfEdge.uuid} (${wfEdge.sourceNodeUuid} -> ${wfEdge.targetNodeUuid})`)
    } else {
      console.warn(`跳过无效的边: ${wfEdge.uuid}, 源节点: ${wfEdge.sourceNodeUuid}, 目标节点: ${wfEdge.targetNodeUuid}`)
      console.warn('源节点存在:', validNodeIds.has(wfEdge.sourceNodeUuid))
      console.warn('目标节点存在:', validNodeIds.has(wfEdge.targetNodeUuid))
    }
  }
  
  // 使用 nextTick 确保 DOM 更新安全
  nextTick(() => {
    // 安全地更新数组
    uiWorkflow.nodes.length = 0
    uiWorkflow.edges.length = 0
    uiWorkflow.nodes.push(...newNodes)
    uiWorkflow.edges.push(...newEdges)
    
    console.log('最终渲染结果:')
    console.log('UI节点数量:', uiWorkflow.nodes.length)
    console.log('UI边数量:', uiWorkflow.edges.length)
    console.log('UI节点:', uiWorkflow.nodes)
    console.log('UI边:', uiWorkflow.edges)
  })
}

onNodesChange((changes: NodeChange[]) => {
  let nodeUnSelected = false
  for (const change of changes) {
    // 同步选中状态
    if ('selected' in change) {
      if (!change.selected && selectedWfNode.value?.uuid === (change as any).id) nodeUnSelected = true
    }
    // 同步位置：当拖拽结束或位置变更时写回到 workflow.nodes
    if ((change as any).type === 'position') {
      const wfNode = props.workflow.nodes.find((n: WorkflowNode) => n.uuid === (change as any).id)
      const uiNode = uiWorkflow.nodes.find((n: any) => n.id === (change as any).id)
      if (wfNode && uiNode) {
        wfNode.positionX = uiNode.position.x
        wfNode.positionY = uiNode.position.y
      }
    }
  }
  if (nodeUnSelected) hidePropertyPanel.value = true
})

onEdgesChange((changes: EdgeChange[]) => {
  console.log(changes)
})

onConnect((connection: Connection) => {
  createNewEdge({
    workflow: props.workflow,
    uiWorkflow,
    source: connection.source,
    sourceHandle: connection.sourceHandle ? connection.sourceHandle : '',
    target: connection.target,
  })
})

onInit(() => {
  nextTick(() => fitView())
})

onNodeClick(({ node }: NodeMouseEvent) => {
  if (node && node.selected) {
    selectedWfNode.value = node.data as WorkflowNode
    hidePropertyPanel.value = false
  }
})

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

const wrapper = ref()

function onDrop(event: DragEvent) {
  const comName = event.dataTransfer?.getData('application/vueflow') as string
  const component = props.wfComponents.find((c: WorkflowComponent) => c.name === comName)
  if (!component) { ms.warning('组件未找到'); return }
  if (comName === 'Start' && props.workflow.nodes.some((n: WorkflowNode) => n.wfComponent?.name === 'Start')) { ms.warning('开始节点只能有一个'); return }
  const flowbounds = (wrapper.value as any).$el.getBoundingClientRect()
  const position = project({ x: event.clientX - flowbounds.left, y: event.clientY - flowbounds.top })
  createNewNode(props.workflow, uiWorkflow, component, position)
  const lastNode = uiWorkflow.nodes[uiWorkflow.nodes.length - 1]
  if (lastNode) {
    const graphNode = getNodes.value.find((n: any) => n.id === lastNode.id)
    if (graphNode) addSelectedNodes([graphNode])
  }
}

function onPaletteDragStart(event: DragEvent, name: string) {
  event.dataTransfer?.setData('application/vueflow', name)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

// 将画布中的节点坐标写回 workflow
function syncPositionsFromUi() {
  const nodes = getNodes.value as any[]
  for (const n of nodes) {
    const wfNode = props.workflow.nodes.find((x: WorkflowNode) => x.uuid === n.id)
    if (wfNode) {
      wfNode.positionX = n.position?.x ?? wfNode.positionX
      wfNode.positionY = n.position?.y ?? wfNode.positionY
    }
  }
}

// 拖拽结束时同步该节点的坐标
onNodeDragStop(({ node }: any) => {
  const wfNode = props.workflow.nodes.find((x: WorkflowNode) => x.uuid === node?.id)
  if (wfNode) {
    wfNode.positionX = node.position?.x ?? wfNode.positionX
    wfNode.positionY = node.position?.y ?? wfNode.positionY
  }
})

function onRun() { emit('run', { workflow: props.workflow }) }

async function onSave() {
  if (submitting.value) return
  submitting.value = true
  try {
    // 最后一次同步：以画布为准写回所有节点坐标
    syncPositionsFromUi()
    emit('save', props.workflow)
    // ms.success('保存触发')
  } finally {
    submitting.value = false
  }
}

// 点击边时删除该边
onEdgeClick(({ edge }: any) => {
  const id = edge?.id
  if (!id) return
  const idx = props.workflow.edges.findIndex((e: any) => e.uuid === id || e.id === id)
  if (idx > -1) {
    const removedList = props.workflow.edges.splice(idx, 1)
    const removed = removedList.length ? (removedList[0] as any) : undefined
    if (removed) {
      if (!props.workflow.deleteEdges) props.workflow.deleteEdges = []
      const removedId: string = (removed.uuid || removed.id || '') as string
      if (removedId) props.workflow.deleteEdges.push(removedId)
    }
  }
  const uiIdx = (uiWorkflow.edges as any[]).findIndex((e: any) => e.id === id)
  if (uiIdx > -1) (uiWorkflow.edges as any[]).splice(uiIdx, 1)
})

// 监听 workflow prop 变化，重新渲染
watch(() => props.workflow, () => {
  nextTick(() => {
    renderGraph()
  })
}, { deep: true })

onMounted(() => { renderGraph() })

function onDeleteNode(nodeUuid: string) {
  const idx = props.workflow.nodes.findIndex((n: WorkflowNode) => n.uuid === nodeUuid)
  if (idx > -1) props.workflow.nodes.splice(idx, 1)
  const uiIdx = uiWorkflow.nodes.findIndex((n: any) => n.id === nodeUuid)
  if (uiIdx > -1) uiWorkflow.nodes.splice(uiIdx, 1)
  // 清理右侧属性面板与当前选中节点
  if (selectedWfNode.value?.uuid === nodeUuid) {
    selectedWfNode.value = undefined
    hidePropertyPanel.value = true
  }
  // 取消画布选中状态
  try { addSelectedNodes([]) } catch {}
  emit('deleteNode', nodeUuid)
}

// 向节点组件注入删除回调，便于在节点内部触发删除
provide('wfOnDeleteNode', (uuid: string) => onDeleteNode(uuid))
</script>

<template>
  <div class="chat-box flex flex-col w-full h-full">
    <main class="flex-1 overflow-hidden">
      <div class="h-full overflow-hidden overflow-y-auto">
        <div class="flex h-full">
          <div class="flex-1 dndflow" @drop="onDrop">
            <NLayout has-sider class="h-full">
              <NLayoutSider collapse-mode="transform" show-trigger="bar" :collapsed-width="12" :width="240" :show-collapsed-content="false" content-style="padding: 12px;" bordered>
                <aside>
                  <div class="flex flex-col w-full">
                    <template v-for="component in wfComponents" :key="component.name">
                      <div v-if="component.isEnable !== false" class="flex mt-2 border border-gray-200 cursor-grab text-base h-10 pl-1.5 rounded" :draggable="true" @dragstart="onPaletteDragStart($event, component.name)">
                        <SvgIcon class="mt-3 mr-2" :class="getIconClassByComponentName(component.name)" :icon="getIconByComponentName(component.name)" />
                        <div class="leading-10">{{ component.title }}</div>
                      </div>
                    </template>
                  </div>
                </aside>
              </NLayoutSider>
              <NLayoutContent class="h-full" style="background:#f5f5f5">
                <VueFlow ref="wrapper" :nodes="uiWorkflow.nodes" :edges="uiWorkflow.edges" :node-types="nodeTypes" :edge-types="edgeTypes" fit-view-on-init @dragover="onDragOver">
                  <Background />
                </VueFlow>
                <RightPanel :workflow="props.workflow" :ui-workflow="uiWorkflow" :hide-property-panel="hidePropertyPanel" :wf-node="selectedWfNode" />
                <div class="absolute right-5 top-3 flex items-center">
                  <NButton :disabled="submitting" text-color="black" color="white" style="margin-right:1.5rem" class="shadow-lg" @click="onRun">运 行</NButton>
                  <NButton :disabled="submitting" :loading="submitting" type="info" class="shadow-lg" @click="onSave">保 存</NButton>
                </div>
              </NLayoutContent>
            </NLayout>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.dndflow { flex-direction: column; display: flex; height: 100%; }
.dndflow aside { border-right: 1px solid #eee; padding: 15px 10px; font-size: 12px; background: #fcfcfc; }
.dndflow aside>* { margin-bottom: 10px; }
.vue-flow__node { border: 1px solid #eee; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); padding: 10px; border-radius: 10px; background: #FFF; display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 10px; width: 220px; }
.vue-flow__node.selected { border: 1px solid #2563eb; padding: 10px; border-radius: 10px; }
.vue-flow__node.selected .vue-flow__handle { background: #2563eb; }
.vue-flow__edge.selected .vue-flow__edge-path { stroke: #2563eb; stroke-width: 1.5; }
.vue-flow__handle { background: #555; height: 16px; width: 8px; border-radius: 4px }
.vue-flow__node .header { height: 45px; line-height: 45px; margin-bottom: 10px; text-align: center; font-weight: 600; }
.vue-flow__node .content_line { height: 40px; line-height: 40px; background: #9696961a; margin-bottom: 10px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media screen and (min-width: 768px) { .dndflow { flex-direction: row; } }
</style>


