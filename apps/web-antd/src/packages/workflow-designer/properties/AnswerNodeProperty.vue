<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Input, Select } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { requestClient } from '#/api/request'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any
if (nodeConfig.category === undefined) nodeConfig.category = ''

// 模型下拉选项
const modelOptions = ref<Array<{ label: string; value: string; category?: string }>>([]);

async function fetchModels() {
  try {
    const res: any = await requestClient.get('/system/model/list', { params: {} })
    const records = (res?.records || res?.rows || res || []) as Array<any>
    modelOptions.value = records.map((m: any) => ({
      label: m.modelName,
      value: m.modelName,
      category: m.category ?? '',
    }))
  } catch (e) {
    modelOptions.value = []
  }
}

onMounted(() => { fetchModels() })

// 监听编码变化，自动写回可读名称，保证画布节点始终展示名称
watch(() => nodeConfig.model_name, (val) => {
  if (!val) { nodeConfig.model_name = ''; return }
  const hit = modelOptions.value.find(opt => opt.value === String(val))
  nodeConfig.model_name = hit ? hit.label : String(val)
  // 同步保存分类到 nodeConfig.category（来自后端的 category 字段）
  nodeConfig.category = hit?.category ?? ''
})
</script>



<template>
  <div class="flex flex-col w-full">
    <!-- 放在第一位：变量选择器（多变量，写入 inputConfig.ref_inputs） -->
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" :exclude-nodes="[wfNode.uuid]" />
    <div class="mt-2">
      <div class="text-sm mb-1">模型名</div>
      <Select v-model:value="nodeConfig.model_name" :options="modelOptions" show-search :allow-clear="true" placeholder="请选择模型" class="w-full" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">提示词<span class="text-red-500">*</span></div>
      <textarea v-model="nodeConfig.prompt" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" style="min-height: 300px; resize: vertical;"></textarea>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-input-textarea) {
  min-height: 200px !important;
  display: block !important;
}

:deep(.ant-input-textarea .ant-input) {
  min-height: 200px !important;
  vertical-align: top !important;
  text-align: left !important;
  line-height: 1.5 !important;
  padding-top: 4px !important;
  display: block !important;
  height: auto !important;
}
</style>


