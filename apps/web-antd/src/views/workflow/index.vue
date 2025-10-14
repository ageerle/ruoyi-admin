<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorkflowDesigner from '#/packages/workflow-designer/StandaloneWorkflowDesigner.vue'
import WorkflowSidebar from './components/WorkflowSidebar.vue'
import type { WorkflowInfo, WorkflowComponent } from '#/packages/workflow-designer/types/index.d'
import { NMessageProvider, NModal } from 'naive-ui'
import { workflowApi } from '#/api/workflow'
import RunDetail from '#/packages/workflow-designer/components/RunDetail.vue'
import { message } from 'ant-design-vue'

// 工作流组件列表，从后端接口获取
const wfComponents = ref<WorkflowComponent[]>([])

// 组件ID映射，根据后端返回的组件列表自动生成
const componentIdMap = ref<Record<number, string>>({})
// 组件Name到ID的反向映射，用于保存时写入数值ID
const nameToIdMap = ref<Record<string, number>>({})

// 获取工作流组件列表
async function fetchWorkflowComponents() {
  try {
    const res = await workflowApi.workflowComponents()
    wfComponents.value = res || []
    
    // 根据组件列表自动生成ID映射
    generateComponentIdMap()
  } catch (error) {
    message.error('获取工作流组件失败')
    // 如果接口失败，使用默认组件列表
    wfComponents.value = [
      { name: 'Start', title: '开始' },
      { name: 'End', title: '结束' },
      { name: 'Answer', title: '回答' },
    ]
    generateComponentIdMap()
  }
}

// 根据组件列表生成ID映射
function generateComponentIdMap() {
  const map: Record<number, string> = {}
  
  // 如果后端返回的组件包含ID信息，使用后端数据
  // 否则使用默认映射
  wfComponents.value.forEach((component, index) => {
    // 假设后端组件有id字段，如果没有则使用索引
    const id = (component as any).id ?? index
    map[id] = component.name
  })
  
  // 如果没有组件或组件为空，使用默认映射
  if (Object.keys(map).length === 0) {
    map[0] = 'Start'
    map[1] = 'End'
    map[2] = 'Answer'
  }
  
  componentIdMap.value = map
  // 生成 name -> id 反向映射
  nameToIdMap.value = Object.fromEntries(
    Object.entries(map).map(([id, name]) => [name, Number(id)])
  )
  console.log('生成的组件ID映射:', map)
}

const workflow = ref<WorkflowInfo>({
  uuid: 'demo-1',
  title: '演示工作流',
  nodes: [
    {
      uuid: 'start-1',
      title: '开始',
      workflowUuid: 'demo-1',
      wfComponent: { name: 'Start', title: '开始' },
      workflowComponentId: 1,
      inputConfig: { user_inputs: [], ref_inputs: [] },
      nodeConfig: { prologue: '' },
      outputConfig: {},
      positionX: 60,
      positionY: 120,
    },
  ],
  edges: [],
})

const sidebarCollapsed = ref(false)
const showRun = ref(false)
const saving = ref(false)

async function handleSave(updated: WorkflowInfo) {
  if (saving.value) return
  saving.value = true
  try {
    // 新增的节点没有 workflowComponentId, 需要手动设置 workflowComponentId
    updated.nodes.forEach((node) => {
      if (node.wfComponent) {
        // 使用 name -> id 映射，确保为 number 类型
        node.workflowComponentId = nameToIdMap.value[node.wfComponent?.name || ''] ?? 0
      }
      if (node.nodeConfig === undefined) {
        node.nodeConfig = {}
      }
    })
    console.log('handleSave', updated)
    await workflowApi.workflowUpdate({
      uuid: updated.uuid,
      title: updated.title,
      remark: (updated as any).remark ?? '',
      isPublic: (updated as any).isPublic ?? false,
      nodes: updated.nodes || [],
      edges: updated.edges || [],
    })
    message.success('保存成功')
    // 更新本地状态，触发编辑器重新渲染
    workflow.value = { ...updated }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

function handleRun() {
  showRun.value = true
}

function handleSelectWorkflow(selectedWorkflow: WorkflowInfo) {
  workflow.value = selectedWorkflow
}

// 组件挂载时获取工作流组件列表
onMounted(() => {
  fetchWorkflowComponents()
})
</script>

<template>
  <div class="workflow-page">
    <n-message-provider>
      <div class="workflow-container">
        <!-- 左侧面板 -->
        <div class="left-panel" :class="{ collapsed: sidebarCollapsed }">
          <WorkflowSidebar 
            :collapsed="sidebarCollapsed"
            :wf-components="wfComponents"
            @update:collapsed="sidebarCollapsed = $event"
            @select-workflow="handleSelectWorkflow"
          />
        </div>
        
        <!-- 右侧工作流编辑器 -->
        <div class="right-panel">
          <WorkflowDesigner 
            :workflow="workflow" 
            :wf-components="wfComponents" 
            :component-id-map="componentIdMap"
            :saving="saving"
            @save="handleSave" 
            @run="handleRun" 
          />
        </div>
      </div>
      <NModal v-model:show="showRun" preset="card" title="运行" :mask-closable="false" style="width:95%;max-width:800px">
        <RunDetail :workflow="workflow" />
      </NModal>
    </n-message-provider>
  </div>
</template>

<style scoped>
.workflow-page {
  height: 100%; /* 页面容器占满视窗，并裁剪滚动 */
  overflow: hidden;
}
.workflow-container {
  display: flex;
  height: 100%; /* 跟随父级高度，避免叠加头部造成溢出 */
  width: 100%;
  overflow: hidden; /* 禁止页面级滚动，仅区域滚动 */
}

.left-panel {
  width: 300px;
  transition: width 0.3s ease;
  border-right: 1px solid #e0e0e0;
  background: white;
}

.left-panel.collapsed {
  width: 0;
  background: transparent;
  border-right: none;
  overflow: visible;
}

.right-panel {
  flex: 1;
  min-width: 0;
  background: #f5f5f5;
  overflow: hidden; /* 右侧由内部编辑器掌控滚动（通常为画布，不滚动）*/
}
</style>
