<script setup lang="ts">
import { h } from 'vue'
import { NDropdown } from 'naive-ui'
import SvgIcon from '../components/SvgIcon.vue'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'

interface Props { wfNode: Workflow.WorkflowNode }
const props = defineProps<Props>()

const options = [{ label: '删除', key: 'delete', icon: renderIcon('ri:delete-bin-line') }]

const emit = defineEmits<{ (e: 'deleteNode', nodeUuid: string): void }>()

function renderIcon(icon: string) {
  return () => h(SvgIcon, { icon, class: 'text-base cursor-pointer' })
}

function handleSelect(key: string | number) {
  if (key === 'delete') emit('deleteNode', props.wfNode.uuid)
}
</script>

<template>
  <div class="w-full flex border-b divide-gray-400 pb-3 mb-3 font-bold text-base text-center items-center justify-center">
    <div class="w-6 mr-2">
      <SvgIcon class="text-xl" :class="getIconClassByComponentName(wfNode.wfComponent.name)" :icon="getIconByComponentName(wfNode.wfComponent.name)" />
    </div>
    <div class="flex-1 max-h-6 overflow-hidden text-nowrap">{{ wfNode.title }}</div>
    <div class="w-6 ml-2">
      <NDropdown v-if="wfNode.wfComponent.name !== 'Start'" :options="options" @select="handleSelect">
        <SvgIcon class="cursor-pointer" icon="ri:more-fill" />
      </NDropdown>
    </div>
  </div>
</template>


