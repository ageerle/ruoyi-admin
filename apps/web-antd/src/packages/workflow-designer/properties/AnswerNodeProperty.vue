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

// 模型下拉选项
const modelOptions = ref<Array<{ label: string; value: string }>>([]);

// 变量引用（多条），持久化到 inputConfig.ref_inputs
(props.wfNode as any).inputConfig = (props.wfNode as any).inputConfig || { user_inputs: [], ref_inputs: [] }
if (!Array.isArray(props.wfNode.inputConfig.user_inputs)) (props.wfNode.inputConfig as any).user_inputs = []
if (!Array.isArray(props.wfNode.inputConfig.ref_inputs)) (props.wfNode.inputConfig as any).ref_inputs = []

type RefModel = { node_uuid: string; node_param_name: string }
const refModels = ref<RefModel[]>([])
const keyModels = ref<string[]>([])

function rebuildRefModelsFromNode() {
  const src = Array.isArray(props.wfNode.inputConfig.ref_inputs) ? (props.wfNode.inputConfig.ref_inputs as any[]) : []
  refModels.value = src.map((x: any) => ({ node_uuid: x.node_uuid || '', node_param_name: x.node_param_name || '' }))
  keyModels.value = src.map((x: any) => x.name || '')
}

function writeBackRefInputs() {
  const n = Math.max(refModels.value.length, keyModels.value.length)
  const next: Array<{ name: string; node_uuid: string; node_param_name: string }> = []
  for (let i = 0; i < n; i++) {
    const m = refModels.value[i] || { node_uuid: '', node_param_name: '' }
    const name = keyModels.value[i] || `var_${i + 1}`
    next.push({ name, node_uuid: m.node_uuid, node_param_name: m.node_param_name })
  }
  ;(props.wfNode.inputConfig as any).ref_inputs = next
}

rebuildRefModelsFromNode()
watch(refModels, writeBackRefInputs, { deep: true })
watch(keyModels, writeBackRefInputs, { deep: true })

async function fetchModels() {
  try {
    const res: any = await requestClient.get('/system/model/list', { params: {} })
    const records = (res?.records || res?.rows || res || []) as Array<any>
    modelOptions.value = records.map((m: any) => ({
      label: m.name ?? m.modelName ?? String(m.id ?? m.modelCode ?? ''),
      value: m.name ?? m.modelName ?? String(m.id ?? m.modelCode ?? ''),
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
})
</script>



<template>
  <div class="flex flex-col w-full">
    <!-- 放在第一位：变量选择器（多变量，写入 inputConfig.ref_inputs） -->
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" v-model="refModels" :display-keys="keyModels" @update:displayKeys="(ks:any)=> keyModels = ks" :exclude-nodes="[wfNode.uuid]" />
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


