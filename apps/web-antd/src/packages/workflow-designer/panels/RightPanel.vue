<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Input } from 'ant-design-vue'
import SvgIcon from '../components/SvgIcon.vue'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'
import GenericNodeProperty from '../properties/GenericNodeProperty.vue'
import type { WorkflowInfo, UIWorkflow, WorkflowNode } from '../types/index.d'

interface Props {
  workflow: WorkflowInfo
  uiWorkflow: UIWorkflow
  hidePropertyPanel: boolean
  wfNode?: WorkflowNode
}
const props = withDefaults(defineProps<Props>(), {
  hidePropertyPanel: false,
  wfNode: undefined,
})

const nodeTitle = ref<string>('')

watch(() => props.wfNode, (val) => { nodeTitle.value = val?.title || '' }, { immediate: true })
watch(nodeTitle, (val) => { if (props.wfNode) props.wfNode.title = val }, { immediate: false })

const innerHeight = window.innerHeight < 800 ? 800 : window.innerHeight
onMounted(() => { nodeTitle.value = props.wfNode?.title || '' })

// 自动扫描专属属性面板：文件名 <Name>NodeProperty.vue → 键名为小写 name
const propertyModules = import.meta.glob('../properties/*NodeProperty.vue', {
  eager: true,
  import: 'default',
}) as Record<string, any>

function toPropertyKey(path: string) {
  const file = path.substring(path.lastIndexOf('/') + 1)
  return file.replace(/NodeProperty\.vue$/, '').toLowerCase()
}

const propertyMap = Object.fromEntries(
  Object.entries(propertyModules).map(([p, mod]) => [toPropertyKey(p), mod]),
)

const resolvedPropertyComponent = computed(() => {
  const name = props.wfNode?.wfComponent?.name?.toLowerCase()
  if (!name) return GenericNodeProperty
  return propertyMap[name] || GenericNodeProperty
})
</script>

<template>
  <div class="absolute right-0 top-20 bg-white rounded-lg shadow-xl">
    <div v-if="!hidePropertyPanel && wfNode" class="px-3 pt-5 h-full" style="width:600px">
      <div class="w-full flex flex-col border-b divide-gray-400 pb-3 mb-5">
        <div class="text-3xl flex items-center h-10 mb-2">
          <SvgIcon class="mt-1 mr-2" :class="getIconClassByComponentName(wfNode?.wfComponent?.name || '')" :icon="getIconByComponentName(wfNode?.wfComponent?.name || '')" />
          <Input v-model:value="nodeTitle" placeholder="节点名称" class="h-8 border-gray-100" style="font-size: 1rem;line-height: 1.5rem;font-weight: 700;" />
        </div>
        <div class="text-sm text-gray-500">组件功能：{{ wfNode?.wfComponent?.remark || '' }}</div>
      </div>
      <div class="overflow-y-auto" :style="`height:${innerHeight - 250}px`">
        <component :is="resolvedPropertyComponent" :workflow="workflow" :ui-workflow="uiWorkflow" :wf-node="wfNode" />
      </div>
    </div>
  </div>
</template>


