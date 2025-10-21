<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()
const path = computed(() => getBezierPath(props))
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <BaseEdge :path="path[0]" />
  <EdgeLabelRenderer>
    <div :style="{ pointerEvents: 'none', position: 'absolute', transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)` }" class="nodrag nopan" />
  </EdgeLabelRenderer>
</template>


