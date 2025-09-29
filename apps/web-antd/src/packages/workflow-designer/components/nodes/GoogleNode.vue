<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import CommonNodeHeader from '../../components/CommonNodeHeader.vue'

defineProps<NodeProps>()
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
    <CommonNodeHeader :wf-node="data" />
    <div class="flex-1 flex-col">
      <div class="content_line text-left px-3">国家和地区： {{ data.nodeConfig?.country || 'cn' }}</div>
      <div class="content_line text-left px-3">语言： {{ data.nodeConfig?.language || 'zh-cn' }}</div>
      <div class="content_line text-left px-3">提取数量： {{ data.nodeConfig?.top_n ?? 5 }}</div>
    </div>
  </div>
</template>


