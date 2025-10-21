<script setup lang="ts">
import { h, inject } from 'vue'
import { Dropdown } from 'ant-design-vue'
import SvgIcon from '../components/SvgIcon.vue'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'

interface Props { wfNode: Workflow.WorkflowNode }
const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'deleteNode', nodeUuid: string): void }>()
const injectedDelete = inject<(uuid: string) => void>('wfOnDeleteNode')

function handleMenuClick({ key }: { key: string }) {
  if (key === 'delete') {
    // 兼容两种触发：向上冒泡 或 直接注入调用
    if (injectedDelete) injectedDelete(props.wfNode.uuid)
    else emit('deleteNode', props.wfNode.uuid)
  }
}

const menuItems = [
  {
    key: 'delete',
    label: '删除',
    icon: h(SvgIcon, { icon: 'ri:delete-bin-line', class: 'text-base cursor-pointer' }),
  },
]
</script>

<template>
  <div class="w-full flex border-b divide-gray-400 pb-3 mb-3 font-bold text-base text-center items-center justify-center">
    <div class="w-6 mr-2">
      <SvgIcon class="text-xl" :class="getIconClassByComponentName(wfNode.wfComponent.name)" :icon="getIconByComponentName(wfNode.wfComponent.name)" />
    </div>
    <div class="flex-1 max-h-6 overflow-hidden text-nowrap">{{ wfNode.title }}</div>
    <div class="w-6 ml-2">
      <Dropdown v-if="wfNode.wfComponent.name !== 'Start'" :menu="{ items: menuItems, onClick: handleMenuClick }">
        <SvgIcon class="cursor-pointer" icon="ri:more-fill" />
      </Dropdown>
    </div>
  </div>
</template>


