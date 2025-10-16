<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { NInput, NSelect } from 'naive-ui'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { requestClient } from '#/api/request'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any
if (nodeConfig.vategory === undefined) nodeConfig.vategory = ''

// 模型下拉选项
const modelOptions = ref<Array<{ label: string; value: string; category?: string }>>([]);

async function fetchModels() {
  try {
    const res: any = await requestClient.get('/system/model/list', { params: {} })
    const records = (res?.records || res?.rows || res || []) as Array<any>
    modelOptions.value = records.map((m: any) => ({
      label: m.modelName ?? m.name ?? String(m.id ?? m.modelCode ?? ''),
      value: m.modelName ?? m.name ?? String(m.id ?? m.modelCode ?? ''),
      category: m.category ?? '',
    }))
  } catch (e) {
    modelOptions.value = []
  }
}

onMounted(() => { fetchModels() })

// 监听编码变化，自动写回可读名称，保证画布节点始终展示名称
watch(() => nodeConfig.model_code, (val) => {
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
      <NSelect v-model:value="nodeConfig.model_code" :options="modelOptions" filterable clearable placeholder="请选择模型" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">提示词</div>
      <NInput v-model:value="nodeConfig.prompt" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" />
    </div>
  </div>
</template>


