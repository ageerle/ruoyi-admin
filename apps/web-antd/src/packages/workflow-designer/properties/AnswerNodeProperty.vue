<script setup lang="ts">
import { NInput } from 'naive-ui'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="mt-2">
      <div class="text-sm mb-1">模型名</div>
      <NInput v-model:value="nodeConfig.model_name" placeholder="例如：gpt-3.5" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">提示词</div>
      <NInput v-model:value="nodeConfig.prompt" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" />
    </div>
  </div>
</template>


