<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, computed, provide, watch, markRaw } from 'vue'
import { Button, message } from 'ant-design-vue'
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
  saving?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  workflow: () => emptyWorkflowInfo(),
  wfComponents: () => [],
  componentIdMap: () => ({}),
  saving: false,
})

// 组件库收起状态
const siderCollapsed = ref(false)

const emit = defineEmits<{
  (e: 'save', workflow: WorkflowInfo): void
  (e: 'run', payload: { workflow: WorkflowInfo }): void
  (e: 'deleteNode', nodeUuid: string): void
}>()

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
  if (!component) { message.warning('组件未找到'); return }
  if (comName === 'Start' && props.workflow.nodes.some((n: WorkflowNode) => n.wfComponent?.name === 'Start')) { message.warning('开始节点只能有一个'); return }
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
  if (props.saving) return
  // 最后一次同步：以画布为准写回所有节点坐标
  syncPositionsFromUi()
  // 去重 deleteEdges，避免重复 id
  if (Array.isArray((props.workflow as any).deleteEdges)) {
    const dedup = Array.from(new Set((props.workflow as any).deleteEdges))
    ;(props.workflow as any).deleteEdges = dedup
  }
  emit('save', props.workflow)
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
  // 同步删除与该节点相关的边，并记录到 deleteEdges，确保后端同步删除
  const toRemove: any[] = []
  for (let i = props.workflow.edges.length - 1; i >= 0; i--) {
    const e: any = props.workflow.edges[i]
    if (e.sourceNodeUuid === nodeUuid || e.targetNodeUuid === nodeUuid) {
      const removed = props.workflow.edges.splice(i, 1)[0]
      if (removed) toRemove.push(removed)
    }
  }
  if (toRemove.length > 0) {
    if (!props.workflow.deleteEdges) (props.workflow as any).deleteEdges = []
    toRemove.forEach((e) => {
      const id: string = (e.uuid || e.id || '') as string
      if (id) (props.workflow as any).deleteEdges.push(id)
      // 从 UI 边列表中删除
      const uiIdx2 = (uiWorkflow.edges as any[]).findIndex((x: any) => x.id === id)
      if (uiIdx2 > -1) (uiWorkflow.edges as any[]).splice(uiIdx2, 1)
    })
  }
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
  <div class="workflow-designer-root">
    <!-- 左侧组件面板 -->
    <div class="workflow-sider" :class="{ collapsed: siderCollapsed }">
      <div class="sider-header">
        <div class="header-content">
          <div class="header-title">组件库</div>
          <div class="header-subtitle">拖拽组件到画布</div>
        </div>
        <Button 
          size="small" 
          type="text" 
          class="collapse-toggle"
          @click="siderCollapsed = !siderCollapsed"
        >
          <SvgIcon :icon="siderCollapsed ? 'ri:arrow-right-s-line' : 'ri:arrow-left-s-line'" class="text-lg" />
        </Button>
      </div>
      <div class="component-list">
        <template v-for="component in wfComponents" :key="component.name">
          <div 
            v-if="component.isEnable !== false" 
            class="component-item" 
            :draggable="true" 
            @dragstart="onPaletteDragStart($event, component.name)"
          >
            <div class="component-icon">
              <SvgIcon :class="getIconClassByComponentName(component.name)" :icon="getIconByComponentName(component.name)" />
            </div>
            <div class="component-name">{{ component.title }}</div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 展开按钮（当侧边栏收起时显示） -->
    <div v-if="siderCollapsed" class="sider-expand-btn" @click="siderCollapsed = false">
      <SvgIcon icon="ri:arrow-right-s-line" class="text-lg" />
    </div>
    
    <!-- 右侧画布区域 -->
    <div class="workflow-canvas-container" @drop="onDrop" @dragover="onDragOver">
      <VueFlow ref="wrapper" :nodes="uiWorkflow.nodes" :edges="uiWorkflow.edges" :node-types="nodeTypes" :edge-types="edgeTypes" fit-view-on-init class="workflow-canvas">
        <Background />
      </VueFlow>
      <RightPanel :workflow="props.workflow" :ui-workflow="uiWorkflow" :hide-property-panel="hidePropertyPanel" :wf-node="selectedWfNode" />
      <div class="canvas-toolbar">
        <Button :disabled="props.saving" class="toolbar-btn toolbar-btn-default" @click="onRun">运 行</Button>
        <Button :disabled="props.saving" :loading="props.saving" type="primary" class="toolbar-btn" @click="onSave">保 存</Button>
      </div>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

/* 工作流设计器根容器 */
.workflow-designer-root {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

/* 左侧组件面板 */
.workflow-sider { 
  width: 260px; 
  height: 100%;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  overflow: hidden;
}

.workflow-sider.collapsed {
  width: 0;
  opacity: 0;
  border-right: none;
}

/* 侧边栏头部 */
.sider-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
}

.header-subtitle {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.collapse-toggle {
  padding: 4px;
  height: auto;
  min-width: auto;
  color: #666;
  flex-shrink: 0;
}

.collapse-toggle:hover {
  color: #1890ff;
  background: #f0f9ff;
}

/* 展开按钮 */
.sider-expand-btn {
  position: absolute;
  left: 0;
  top: 16px;
  width: 32px;
  height: 48px;
  background: white;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  color: #666;
}

.sider-expand-btn:hover {
  background: #f0f9ff;
  border-color: #1890ff;
  color: #1890ff;
  width: 36px;
}

/* 组件列表 */
.component-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 美化滚动条 */
.component-list::-webkit-scrollbar {
  width: 6px;
}

.component-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.component-list::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.component-list::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* 组件项 */
.component-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.component-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  transform: translateY(-1px);
}

.component-item:active {
  cursor: grabbing;
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(24, 144, 255, 0.2);
}

.component-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
  flex-shrink: 0;
}

.component-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.vue-flow__node { 
  border: 1px solid #eee; 
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); 
  padding: 10px; 
  border-radius: 10px; 
  background: #FFF; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  align-items: center; 
  gap: 10px; 
  width: 220px; 
}

.vue-flow__node.selected { 
  border: 1px solid #2563eb; 
  padding: 10px; 
  border-radius: 10px; 
}

.vue-flow__node.selected .vue-flow__handle { 
  background: #2563eb; 
}

.vue-flow__edge.selected .vue-flow__edge-path { 
  stroke: #2563eb; 
  stroke-width: 1.5; 
}

.vue-flow__handle { 
  background: #555; 
  height: 16px; 
  width: 8px; 
  border-radius: 4px;
}

.vue-flow__node .header { 
  height: 45px; 
  line-height: 45px; 
  margin-bottom: 10px; 
  text-align: center; 
  font-weight: 600; 
}

.vue-flow__node .content_line { 
  height: 40px; 
  line-height: 40px; 
  background: #9696961a; 
  margin-bottom: 10px; 
  text-align: center; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

/* 工作流画布容器 - 占据剩余空间 */
.workflow-canvas-container {
  flex: 1;
  height: 100%;
  min-width: 0;
  position: relative;
  background: #fafafa;
}

/* VueFlow 画布 - 绝对定位占满父容器 */
.workflow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

/* 画布工具栏 */
.canvas-toolbar {
  position: absolute;
  right: 20px;
  top: 16px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.toolbar-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.toolbar-btn-default {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
}

.toolbar-btn-default:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>


