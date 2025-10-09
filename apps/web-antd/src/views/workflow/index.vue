<script setup lang="ts">
import { ref } from 'vue'
import WorkflowDesigner from '#/packages/workflow-designer/StandaloneWorkflowDesigner.vue'
import WorkflowSidebar from './components/WorkflowSidebar.vue'
import type { WorkflowInfo, WorkflowComponent } from '#/packages/workflow-designer/types/index.d'
import { NMessageProvider } from 'naive-ui'

// 要使用的节点列表，不使用时可以注释掉
const wfComponents: WorkflowComponent[] = [
  { name: 'Start', title: '开始' },
  { name: 'End', title: '结束' },
  { name: 'Answer', title: '回答' },
  { name: 'Classifier', title: '内容分类' },
  { name: 'DocumentExtractor', title: '文档抽取' },
  { name: 'KeywordExtractor', title: '关键词抽取' },
  { name: 'FaqExtractor', title: 'FAQ 抽取' },
  { name: 'KnowledgeRetrieval', title: '知识检索' },
  { name: 'Switcher', title: '条件分支' },
  { name: 'Template', title: '模板' },
  { name: 'Dalle3', title: 'Dalle3 绘图' },
  { name: 'Tongyiwanx', title: '通义万相' },
  { name: 'Google', title: 'Google 搜索' },
  { name: 'HumanFeedback', title: '人工反馈' },
  { name: 'MailSend', title: '邮件发送' },
  { name: 'HttpRequest', title: 'HTTP 请求' },
  { name: 'Test', title: '测试' },
]

const workflow = ref<WorkflowInfo>({
  uuid: 'demo-1',
  title: '演示工作流',
  nodes: [
    {
      uuid: 'start-1',
      title: '开始',
      workflowUuid: 'demo-1',
      wfComponent: { name: 'Start', title: '开始' },
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

function handleSave(updated: WorkflowInfo) {
  console.log('save demo workflow', updated)
}

function handleRun(payload: { workflow: WorkflowInfo }) {
  console.log('run demo workflow', payload.workflow)
}

function handleSelectWorkflow(selectedWorkflow: WorkflowInfo) {
  workflow.value = selectedWorkflow
}
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
            @save="handleSave" 
            @run="handleRun" 
          />
        </div>
      </div>
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
