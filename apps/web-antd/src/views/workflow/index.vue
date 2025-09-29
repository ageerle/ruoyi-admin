<script setup lang="ts">
import { ref } from 'vue'
import WorkflowDesigner from '#/packages/workflow-designer/StandaloneWorkflowDesigner.vue'
import type { WorkflowInfo, WorkflowComponent, WorkflowNode } from '#/packages/workflow-designer/types/index.d'
import { NMessageProvider } from 'naive-ui'

const wfComponents: WorkflowComponent[] = [
  { name: 'Start', title: '开始' },
  { name: 'End', title: '结束' },
  { name: 'Answer', title: '回答' },
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

function handleSave(updated: WorkflowInfo) {
  console.log('save demo workflow', updated)
}

function handleRun(payload: { workflow: WorkflowInfo }) {
  console.log('run demo workflow', payload.workflow)
}
</script>

<template>
  <div class="h-full">
    <n-message-provider>
      <WorkflowDesigner :workflow="workflow" :wf-components="wfComponents" @save="handleSave" @run="handleRun" />
    </n-message-provider>
  </div>
  
</template>


