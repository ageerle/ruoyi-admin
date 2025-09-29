<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import CommonNodeHeader from '../../components/CommonNodeHeader.vue'
import SvgIcon from '../../components/SvgIcon.vue'

defineProps<NodeProps>()
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle type="source" :position="Position.Right" />
    <CommonNodeHeader :wf-node="data" />
    <div class="flex-1 flex-col">
      <div v-for="userInputDef in data.inputConfig.user_inputs" :key="userInputDef.uuid" class="content_line flex justify-items-start px-2">
        <div class="flex-none w-4 content-center mr-1">
          <SvgIcon v-if="userInputDef.type === 1" icon="carbon:string-text" />
          <SvgIcon v-else-if="userInputDef.type === 2" icon="carbon:string-integer" />
          <SvgIcon v-else-if="userInputDef.type === 3" icon="carbon:list-boxes" />
          <SvgIcon v-else-if="userInputDef.type === 4" icon="carbon:list-dropdown" />
          <SvgIcon v-else-if="userInputDef.type === 5" icon="carbon:boolean" />
        </div>
        <div class="w-24 overflow-hidden mr-1">{{ userInputDef.name }}</div>
        <div class="flex-1 overflow-hidden">{{ userInputDef.title }}</div>
      </div>
    </div>
  </div>
</template>


