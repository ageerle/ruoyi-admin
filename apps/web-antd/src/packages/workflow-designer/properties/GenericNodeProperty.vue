<script setup lang="ts">
import { computed } from 'vue'
import { Input, InputNumber, Switch } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode, UIWorkflow } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  wfNode: WorkflowNode
}
const props = defineProps<Props>()

const entries = computed(() => Object.entries(props.wfNode.nodeConfig || {}))

function getVal(key: string) {
  return (props.wfNode.nodeConfig as any)[key]
}

function setVal(key: string, value: any) {
  (props.wfNode.nodeConfig as any)[key] = value
}

function toJson(val: any) {
  try {
    return JSON.stringify(val, null, 2)
  } catch (e) {
    return ''
  }
}

function setFromJson(key: string, json: string) {
  try {
    const obj = JSON.parse(json)
    setVal(key, obj)
  } catch (e) {
    // ignore parse error
  }
}
</script>

<template>
  <div class="px-2 space-y-3">
    <div class="text-base font-bold">节点参数</div>
    <div v-if="!entries.length" class="text-neutral-400">无可编辑参数</div>
    <div v-for="[k, v] in entries" :key="k" class="space-y-1">
      <div class="text-xs text-neutral-500">{{ k }}</div>
      <div v-if="typeof v === 'boolean'">
        <Switch :checked="getVal(k)" @update:checked="(val: boolean) => setVal(k, val)" />
      </div>
      <div v-else-if="typeof v === 'number'">
        <InputNumber :value="getVal(k)" @update:value="(val: number) => setVal(k, val)" class="w-full" />
      </div>
      <div v-else-if="typeof v === 'string'">
        <Input :value="getVal(k)" @update:value="(val: string) => setVal(k, val)" />
      </div>
      <div v-else-if="Array.isArray(v)">
        <Input type="textarea" :value="toJson(getVal(k))" :auto-size="{ minRows: 3, maxRows: 12 }" @update:value="(val: string) => setFromJson(k, val)" />
      </div>
      <div v-else-if="typeof v === 'object' && v !== null">
        <Input type="textarea" :value="toJson(getVal(k))" :auto-size="{ minRows: 3, maxRows: 12 }" @update:value="(val: string) => setFromJson(k, val)" />
      </div>
      <div v-else class="text-neutral-400">Unsupported</div>
    </div>
  </div>
</template>


