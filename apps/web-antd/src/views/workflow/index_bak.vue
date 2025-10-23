<script setup lang="ts">
import { ref } from 'vue'
import WorkflowDesigner from '#/packages/workflow-designer/StandaloneWorkflowDesigner.vue'
import type { WorkflowInfo, WorkflowComponent } from '#/packages/workflow-designer/types/index.d'
import { NMessageProvider } from 'naive-ui'

/**
 * 备份文件，用于对比新旧版本
 * 用于测试工作流编辑器
 */
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

// 简单的组件ID映射：使用索引生成（示例/演示用）
const componentIdMap: Record<number, string> = Object.fromEntries(
  wfComponents.map((c, idx) => [idx + 1, c.name]),
) as Record<number, string>

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
      <WorkflowDesigner :workflow="workflow" :wf-components="wfComponents" :component-id-map="componentIdMap" @save="handleSave" @run="handleRun" />
    </n-message-provider>
  </div>
  
</template>


