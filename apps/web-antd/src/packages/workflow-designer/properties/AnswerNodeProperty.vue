<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { NInput, NSelect } from 'naive-ui'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { requestClient } from '#/api/request'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any

// 模型下拉选项
const modelOptions = ref<Array<{ label: string; value: string }>>([])

async function fetchModels() {
  try {
    const res: any = await requestClient.get('/system/model/list', { params: {} })
    const records = (res?.records || res?.rows || res || []) as Array<any>
    modelOptions.value = records.map((m: any) => ({
      // 优先展示后端提供的“模型名称”字段
      label: m.modelName || m.name || m.displayName || m.label || m.code || m.id,
      // 取可唯一标识的编码作为值，兼容后端多种命名
      value: m.modelCode || m.code || m.id || m.name,
    }))
    // 若已有名称但无编码，反查编码；若已有编码，同步名称
    if (nodeConfig.model_name && !nodeConfig.model_code) {
      const hit = modelOptions.value.find(opt => opt.label === nodeConfig.model_name)
      if (hit) nodeConfig.model_code = hit.value
    }
    if (nodeConfig.model_code) {
      const hit = modelOptions.value.find(opt => opt.value === nodeConfig.model_code)
      if (hit) nodeConfig.model_name = hit.label
    }
  } catch (e) {
    modelOptions.value = []
  }
}

onMounted(() => { fetchModels() })

// 监听编码变化，自动写回可读名称，保证画布节点始终展示名称
watch(() => nodeConfig.model_code, (val) => {
  if (!val) { nodeConfig.model_name = ''; return }
  const hit = modelOptions.value.find(opt => opt.value === val)
  nodeConfig.model_name = hit ? hit.label : String(val)
})
</script>



<template>
  <div class="flex flex-col w-full">
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


