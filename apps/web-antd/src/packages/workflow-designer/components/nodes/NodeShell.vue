<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import CommonNodeHeader from '../../components/CommonNodeHeader.vue'

interface Props {
  data: any
  hasTarget?: boolean
  hasSource?: boolean
  extra?: string
}
const props = withDefaults(defineProps<Props>(), { hasTarget: true, hasSource: true, extra: '' })
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle v-if="hasTarget" type="target" :position="Position.Left" />
    <Handle v-if="hasSource" type="source" :position="Position.Right" />
    <CommonNodeHeader :wf-node="data" />
    <div v-if="extra" class="content_line">{{ extra }}</div>
  </div>
  
</template>


