<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Input, InputNumber, Select, Slider, Switch } from 'ant-design-vue'
import type { WorkflowInfo, WorkflowNode } from '../types/index.d'
import { requestClient } from '#/api/request'
import WfVariableSelector from '../components/WfVariableSelector.vue'

interface Props {
  workflow: WorkflowInfo
  wfNode: WorkflowNode
}
const props = defineProps<Props>()

// 使用 computed 保持响应式：切换同类节点时自动跟随 wfNode 变化
const nodeConfig = computed(() => props.wfNode.nodeConfig as any)

// 确保默认值
function ensureDefaults() {
  const cfg = nodeConfig.value
  if (cfg.knowledge_base_uuid === undefined) cfg.knowledge_base_uuid = ''
  if (cfg.knowledge_base_name === undefined) cfg.knowledge_base_name = ''
  if (cfg.score === undefined) cfg.score = 0.6
  if (cfg.top_n === undefined) cfg.top_n = 3
  if (cfg.is_strict === undefined) cfg.is_strict = true
  if (cfg.default_response === undefined) cfg.default_response = ''
  if (cfg.retrieval_mode === undefined) cfg.retrieval_mode = 'vector'
}

// 当 wfNode 切换时重新初始化默认值
watch(() => props.wfNode, () => ensureDefaults(), { immediate: true })

// 知识库下拉选项
const kbOptions = ref<Array<{ label: string; value: string; description?: string }>>([])
const loading = ref(false)

async function fetchKnowledgeBases() {
  loading.value = true
  try {
    const res: any = await requestClient.get('/system/info/list', { params: {} })
    const records = (res?.records || res?.rows || res || []) as Array<any>
    kbOptions.value = records.map((kb: any) => ({
      label: kb.name,
      value: String(kb.id),
      description: kb.description || '',
    }))
  } catch (e) {
    console.error('获取知识库列表失败', e)
    kbOptions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchKnowledgeBases()
})

// 监听知识库选择变化，同步更新名称
watch(() => nodeConfig.value.knowledge_base_uuid, (val) => {
  if (!val) {
    nodeConfig.value.knowledge_base_name = ''
    return
  }
  const hit = kbOptions.value.find(opt => opt.value === String(val))
  nodeConfig.value.knowledge_base_name = hit ? hit.label : ''
})

// 检索模式选项（含继承选项）
const retrievalModeOptions = [
  { label: '向量检索', value: 'vector' },
  { label: '混合检索', value: 'hybrid' },
]
</script>

<template>
  <div class="flex flex-col w-full">
    <!-- 变量选择器 -->
    <WfVariableSelector :workflow="workflow" :wf-node="wfNode" :exclude-nodes="[wfNode.uuid]" />

    <!-- 知识库选择 -->
    <div class="mt-3">
      <div class="text-sm mb-1">
        <span class="text-red-500">*</span> 知识库
      </div>
      <Select
        v-model:value="nodeConfig.knowledge_base_uuid"
        :options="kbOptions"
        :loading="loading"
        show-search
        :allow-clear="true"
        placeholder="请选择知识库"
        class="w-full"
        :filter-option="(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())"
      >
        <template #option="{ label, description }">
          <div class="flex flex-col">
            <span>{{ label }}</span>
            <span v-if="description" class="text-xs text-gray-400 truncate">{{ description }}</span>
          </div>
        </template>
      </Select>
    </div>

    <!-- 检索模式 -->
    <div class="mt-3">
      <div class="text-sm mb-1">检索模式</div>
      <Select
        v-model:value="nodeConfig.retrieval_mode"
        :options="retrievalModeOptions"
        class="w-full"
      />
      <div class="text-xs text-gray-400 mt-1">
        节点选择的模式将覆盖知识库自身的混合检索配置
      </div>
    </div>

    <!-- 相似度阈值 -->
    <div class="mt-3">
      <div class="text-sm mb-1">
        相似度阈值
        <span class="text-gray-400 text-xs ml-1">{{ nodeConfig.score }}</span>
      </div>
      <Slider
        v-model:value="nodeConfig.score"
        :min="0"
        :max="1"
        :step="0.05"
        :tooltip="{ formatter: (val: number) => val.toFixed(2) }"
      />
      <div class="flex justify-between text-xs text-gray-400">
        <span>宽松 (0)</span>
        <span>严格 (1)</span>
      </div>
    </div>

    <!-- 返回数量 -->
    <div class="mt-3">
      <div class="text-sm mb-1">返回数量</div>
      <InputNumber
        v-model:value="nodeConfig.top_n"
        :min="1"
        :max="20"
        class="w-full"
        placeholder="检索返回的最大结果数"
      />
    </div>

    <!-- 严格模式 -->
    <div class="mt-3 flex items-center justify-between">
      <div class="text-sm">严格模式</div>
      <Switch v-model:checked="nodeConfig.is_strict" />
    </div>
    <div class="text-xs text-gray-400 mt-1">
      开启后，当检索无结果时返回默认回复；关闭则返回空
    </div>

    <!-- 默认回复 -->
    <div v-if="nodeConfig.is_strict" class="mt-3">
      <div class="text-sm mb-1">默认回复</div>
      <Input
        v-model:value="nodeConfig.default_response"
        type="textarea"
        :auto-size="{ minRows: 2, maxRows: 4 }"
        placeholder="当知识库未检索到相关内容时的默认回复"
      />
    </div>
  </div>
</template>
