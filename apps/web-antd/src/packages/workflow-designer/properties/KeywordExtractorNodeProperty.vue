<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Input, InputNumber, Select } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { requestClient } from '#/api/request'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()
const nodeConfig = props.wfNode.nodeConfig as any

// 初始化默认值
if (nodeConfig.category === undefined) nodeConfig.category = ''
if (nodeConfig.model_name === undefined) nodeConfig.model_name = ''
if (nodeConfig.top_n === undefined) nodeConfig.top_n = 5

// 模型下拉选项
const modelOptions = ref<Array<{ label: string; value: string; category?: string }>>([])

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

// 监听模型变化，自动同步分类
watch(() => nodeConfig.model_name, (val) => {
  if (!val) {
    nodeConfig.model_name = ''
    nodeConfig.category = ''
    return
  }
  const hit = modelOptions.value.find(opt => opt.value === String(val))
  nodeConfig.model_name = hit ? hit.label : String(val)
  nodeConfig.category = hit?.category ?? ''
})
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- 变量选择器：引用上游节点输出 -->
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" :exclude-nodes="[wfNode.uuid]" />

    <div class="mt-2">
      <div class="text-sm mb-1">模型名</div>
      <Select v-model:value="nodeConfig.model_name" :options="modelOptions" show-search :allow-clear="true" placeholder="请选择模型" class="w-full" />
    </div>
    <div class="mt-4">
      <div class="text-sm mb-1">关键词数量</div>
      <InputNumber
        v-model:value="nodeConfig.top_n"
        :min="1"
        :max="50"
        placeholder="提取的关键词数量"
      />
    </div>

    <div class="mt-4">
      <div class="text-sm mb-1">提示词（可选）</div>
      <Input
        v-model:value="nodeConfig.prompt"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="可以添加额外的提示词来指导关键词提取"
      />
    </div>
  </div>
</template>

