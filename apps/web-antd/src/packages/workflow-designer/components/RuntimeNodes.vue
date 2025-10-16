<script lang="ts" setup>
import { computed } from 'vue'
import { NImage, NImageGroup } from 'naive-ui'
import SvgIcon from './SvgIcon.vue'
import { getIconByComponentName, getIconClassByComponentName } from '../utils/workflow-util'

interface Props {
  nodes: any[]
  workflow: any
  errorMsg: string
  token?: string
}
const props = defineProps<Props>()

const prologue = computed(() => {
  const startNode = (props.workflow?.nodes || []).find((n: any) => n.wfComponent?.name === 'Start')
  return (startNode?.nodeConfig || {}).prologue || ''
})

function getRealFileUrl(fileUrl: string) {
  if (!fileUrl.includes('http') && !fileUrl.includes('/api')) return `/api${fileUrl}`
  return fileUrl
}
</script>

<template>
  <div>
    <div v-if="errorMsg" class="py-2 text-red-500">错误：{{ errorMsg }}</div>
    <div v-else-if="nodes.length === 0" class="text-center py-2 text-neutral-400">无内容</div>
    <div v-show="prologue" class="p-2">{{ prologue }}</div>
    <div v-for="node in nodes" :key="node.uuid" class="flex flex-col space-y-2 border border-gray-200 p-2 m-2 rounded-md" :title="node.nodeTitle" :name="node.uuid">
      <div class="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
        <SvgIcon v-if="node.wfComponent" class="text-base" :class="getIconClassByComponentName(node.wfComponent.name)" :icon="getIconByComponentName(node.wfComponent.name)" />
        <div class="text-base">{{ node.nodeTitle || '找不到节点标题' }}</div>
      </div>
      <div class="flex flex-col space-y-2">
        <div class="text-base border-b border-gray-200 py-1">输入</div>
        <div v-for="(content, name) in node.input" :key="`input_${name}`" class="flex">
          <div class="min-w-24 pr-2">{{ name }}</div>
          <div>{{ content.value || '无内容' }}</div>
        </div>
        <div class="text-base border-b border-gray-200 py-1">输出</div>
        <!-- 优先展示流式增量（chunks），用于未产出最终输出时的实时渲染 -->
        <div v-if="node.chunks" class="flex">
          <!-- <div class="min-w-24 pr-2">回复</div> -->
          <div class="whitespace-pre-wrap break-words">{{ node.chunks }}</div>
        </div>
        <div v-else v-for="(content, name) in node.output" :key="`onput_${name}`" class="flex">
          <template v-if="content.type === 4">
            <NImageGroup>
              <NImage v-for="url in content.value" :key="url" :src="`${getRealFileUrl(url)}?token=${token || ''}`" width="100" />
            </NImageGroup>
          </template>
          <template v-else>
            <div class="min-w-24 pr-2">{{ name }}</div>
            <div class="whitespace-pre-wrap break-words">{{ content.value || '无内容' }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>


