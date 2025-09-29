<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, computed } from 'vue'
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
}
const props = withDefaults(defineProps<Props>(), {
  workflow: () => emptyWorkflowInfo(),
  wfComponents: () => [],
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
const { onInit, fitView, onConnect, onEdgesChange, onNodesChange, onNodeClick, addSelectedNodes, project } = useVueFlow()

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
    map[toKey(p, 'Node')] = mod
  }
  for (const c of props.wfComponents) {
    const key = c.name.toLowerCase()
    if (!map[key]) map[key] = NodeShell
  }
  return map
})

const edgeTypes = computed(() => {
  const map: Record<string, any> = {}
  for (const [p, mod] of Object.entries(edgeModules)) {
    map[toKey(p, 'Edge')] = mod
  }
  return map
})

function renderGraph() {
  if (uiWorkflow.nodes.length > 0) return
  const initX = 10, initY = 50
  for (let i = 0; i < props.workflow.nodes.length; i++) {
    const node = props.workflow.nodes[i]
    const px = node.positionX ? node.positionX : initX + 230 * i
    const py = node.positionY ? node.positionY : initY
    uiWorkflow.nodes.push({ id: node.uuid, type: node.wfComponent.name.toLowerCase(), data: node, position: { x: px, y: py } })
  }
  for (const wfEdge of props.workflow.edges) {
    uiWorkflow.edges.push({ id: wfEdge.uuid, source: wfEdge.sourceNodeUuid, target: wfEdge.targetNodeUuid, sourceHandle: wfEdge.sourceHandle, type: 'special', animated: true, data: wfEdge })
  }
}

onNodesChange((changes: NodeChange[]) => {
  let nodeUnSelected = false
  for (const change of changes) {
    if ('selected' in change) {
      if (!change.selected && selectedWfNode.value?.uuid === change.id) nodeUnSelected = true
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
  if (comName === 'Start' && props.workflow.nodes.some((n: WorkflowNode) => n.wfComponent.name === 'Start')) { ms.warning('开始节点只能有一个'); return }
  const flowbounds = (wrapper.value as any).$el.getBoundingClientRect()
  const position = project({ x: event.clientX - flowbounds.left, y: event.clientY - flowbounds.top })
  createNewNode(props.workflow, uiWorkflow, component, position)
  addSelectedNodes([uiWorkflow.nodes[uiWorkflow.nodes.length - 1]])
}

function onPaletteDragStart(event: DragEvent, name: string) {
  event.dataTransfer?.setData('application/vueflow', name)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onRun() { emit('run', { workflow: props.workflow }) }

async function onSave() {
  if (submitting.value) return
  submitting.value = true
  try {
    emit('save', props.workflow)
    ms.success('保存触发')
  } finally {
    submitting.value = false
  }
}

onMounted(() => { renderGraph() })

function onDeleteNode(nodeUuid: string) {
  const idx = props.workflow.nodes.findIndex((n: WorkflowNode) => n.uuid === nodeUuid)
  if (idx > -1) props.workflow.nodes.splice(idx, 1)
  const uiIdx = uiWorkflow.nodes.findIndex((n: any) => n.id === nodeUuid)
  if (uiIdx > -1) uiWorkflow.nodes.splice(uiIdx, 1)
  emit('deleteNode', nodeUuid)
}
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


