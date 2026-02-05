<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import NodeShell from './NodeShell.vue'

defineProps<NodeProps>()
</script>

<template>
  <NodeShell :data="data" />
</template>


