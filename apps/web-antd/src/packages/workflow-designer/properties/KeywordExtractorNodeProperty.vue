<script setup lang="ts">
import { Input, InputNumber } from 'ant-design-vue'
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
      <Input v-model:value="nodeConfig.model_name" placeholder="如: keywords-model" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">关键词数量(top_n)</div>
      <InputNumber v-model:value="nodeConfig.top_n" :min="1" :max="50" class="w-full" />
    </div>
  </div>
</template>
 
