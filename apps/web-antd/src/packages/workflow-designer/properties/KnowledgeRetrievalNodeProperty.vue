<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Input, InputNumber, Select, Switch } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { knowledgeList } from '#/api/operator/knowledgeBase'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}

const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any

if (nodeConfig.knowledge_base_uuid === undefined) nodeConfig.knowledge_base_uuid = ''
if (nodeConfig.knowledge_base_name === undefined) nodeConfig.knowledge_base_name = ''
if (nodeConfig.score === undefined) nodeConfig.score = 0.6
if (nodeConfig.top_n === undefined) nodeConfig.top_n = 3
if (nodeConfig.is_strict === undefined) nodeConfig.is_strict = true
if (nodeConfig.default_response === undefined) nodeConfig.default_response = ''

const knowledgeOptions = ref<Array<{ label: string; value: string; id: string; kname: string }>>([])

async function fetchKnowledgeList() {
  try {
    const res: any = await knowledgeList()
    const rows = (res?.rows || []) as Array<any>
    knowledgeOptions.value = rows.map((item: any) => ({
      label: item.kname,
      value: String(item.id ?? item.kid ?? ''),
      id: String(item.id ?? item.kid ?? ''),
      kname: item.kname,
    }))

    if (nodeConfig.knowledge_base_uuid) {
      const hit = knowledgeOptions.value.find(opt => opt.value === String(nodeConfig.knowledge_base_uuid))
      if (hit) {
        nodeConfig.knowledge_base_uuid = hit.value
        nodeConfig.knowledge_base_name = hit.kname || hit.label
      }
    }
  } catch (e) {
    knowledgeOptions.value = []
  }
}

watch(() => nodeConfig.knowledge_base_uuid, (val) => {
  if (!val) {
    nodeConfig.knowledge_base_uuid = ''
    nodeConfig.knowledge_base_name = ''
    return
  }
  const hit = knowledgeOptions.value.find(opt => opt.value === String(val))
  nodeConfig.knowledge_base_uuid = hit ? hit.value : String(val)
  nodeConfig.knowledge_base_name = hit?.kname || hit?.label || String(val)
})

onMounted(() => {
  fetchKnowledgeList()
})
</script>

<template>
  <div class="flex flex-col w-full">
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" :exclude-nodes="[wfNode.uuid]" />

    <div class="mt-2">
      <div class="text-sm mb-1">知识库</div>
      <Select
        v-model:value="nodeConfig.knowledge_base_uuid"
        :options="knowledgeOptions"
        show-search
        :allow-clear="true"
        placeholder="请选择知识库"
        class="w-full"
      />
    </div>

    <div class="mt-4">
      <div class="text-sm mb-1">召回数量</div>
      <InputNumber
        v-model:value="nodeConfig.top_n"
        :min="1"
        :max="50"
        style="width: 100%"
      />
    </div>

    <div class="mt-4">
      <div class="text-sm mb-1">相似度阈值 (0 - 1)</div>
      <InputNumber
        v-model:value="nodeConfig.score"
        :min="0"
        :max="1"
        :step="0.01"
        style="width: 100%"
      />
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm mb-1">严格模式</div>
      <Switch v-model:checked="nodeConfig.is_strict" />
    </div>

    <div class="mt-4">
      <div class="text-sm mb-1">默认回复（未检索到内容时使用）</div>
      <Input.TextArea
        v-model:value="nodeConfig.default_response"
        :auto-size="{ minRows: 2, maxRows: 6 }"
      />
    </div>
  </div>
</template>
