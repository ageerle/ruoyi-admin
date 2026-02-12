<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import CommonNodeHeader from '../CommonNodeHeader.vue'
import SvgIcon from '../SvgIcon.vue'

defineProps<NodeProps>()
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
    <CommonNodeHeader :wf-node="data" />
    <div clas="flex-1 flex-col">
      <div class="content_line flex items-center px-2">
        <SvgIcon class="mx-1.5" icon="mdi:human" />
        {{ data.nodeConfig?.model_name }}
      </div>
    </div>
  </div>
</template>


