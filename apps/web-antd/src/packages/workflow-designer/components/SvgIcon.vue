<script setup lang="ts">
import { VbenIcon } from '@vben/icons'

interface Props { icon: string }
defineProps<Props>()
</script>

<template>
  <VbenIcon :icon="icon" />
</template>


