<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { NInput } from 'naive-ui'
import SvgIcon from '../components/SvgIcon.vue'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'
import StartNodeProperty from '../properties/StartNodeProperty.vue'
import GenericNodeProperty from '../properties/GenericNodeProperty.vue'
import AnswerNodeProperty from '../properties/AnswerNodeProperty.vue'
import KeywordExtractorNodeProperty from '../properties/KeywordExtractorNodeProperty.vue'
import ClassifierNodeProperty from '../properties/ClassifierNodeProperty.vue'
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
</script>

<template>
  <div class="absolute right-0 top-20 bg-white rounded-lg shadow-xl">
    <div v-if="!hidePropertyPanel && wfNode" class="px-3 pt-5 h-full" style="width:600px">
      <div class="w-full flex flex-col border-b divide-gray-400 pb-3 mb-5">
        <div class="text-3xl flex items-center h-10 mb-2">
          <SvgIcon class="mt-1 mr-2" :class="getIconClassByComponentName(wfNode.wfComponent.name)" :icon="getIconByComponentName(wfNode.wfComponent.name)" />
          <NInput v-model:value="nodeTitle" placeholder="节点名称" class="h-8 border-gray-100" style="font-size: 1rem;line-height: 1.5rem;font-weight: 700;" />
        </div>
        <div class="text-sm text-gray-500">组件功能：{{ wfNode.wfComponent.remark }}</div>
      </div>
      <div class="overflow-y-auto" :style="`height:${innerHeight - 250}px`">
        <StartNodeProperty v-if="wfNode.wfComponent.name === 'Start'" :workflow="workflow" :wf-node="wfNode" />
        <AnswerNodeProperty v-else-if="wfNode.wfComponent.name === 'Answer'" :workflow="workflow" :wf-node="wfNode" />
        <KeywordExtractorNodeProperty v-else-if="wfNode.wfComponent.name === 'KeywordExtractor'" :workflow="workflow" :wf-node="wfNode" />
        <ClassifierNodeProperty v-else-if="wfNode.wfComponent.name === 'Classifier'" :workflow="workflow" :ui-workflow="uiWorkflow" :wf-node="wfNode" />
        <GenericNodeProperty v-else :workflow="workflow" :ui-workflow="uiWorkflow" :wf-node="wfNode" />
      </div>
    </div>
  </div>
</template>


