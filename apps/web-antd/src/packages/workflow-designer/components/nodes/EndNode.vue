<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import CommonNodeHeader from '../../components/CommonNodeHeader.vue'

defineProps<NodeProps>()
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle type="target" :position="Position.Left" />
    <CommonNodeHeader :wf-node="data" />
    <div class="flex-1 flex-col">
      <div class="leading-6 bg-gray-100 mb-1 px-1 text-left text-xs line-clamp-3">
        {{ data.nodeConfig?.result }}
      </div>
    </div>
  </div>
</template>


