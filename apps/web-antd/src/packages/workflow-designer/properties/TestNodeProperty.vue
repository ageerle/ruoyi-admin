<script setup lang="ts">
import { NInput, NInputNumber } from 'naive-ui'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any
</script>

<script lang="ts">
// 提供“测试节点”的默认配置，优先级高于集中配置表
export function getDefaultNodeConfig(_workflow: any) {
  return { message: 'hello from Test', count: 1 }
}
</script>

<template>
  <div class="flex flex-col w-full">
    <div class="mt-2">
      <div class="text-sm mb-1">消息</div>
      <NInput v-model:value="nodeConfig.message" placeholder="例如：hello" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">次数</div>
      <NInputNumber v-model:value="nodeConfig.count" :min="0" :max="999" />
    </div>
  </div>
</template>


