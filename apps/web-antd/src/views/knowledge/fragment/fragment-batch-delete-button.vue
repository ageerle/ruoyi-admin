<script setup lang="ts">
import { Button } from 'ant-design-vue';

const props = defineProps<{ hasSelection: () => boolean }>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <Button
    v-if="props.hasSelection()"
    danger
    v-access:code="['system:fragment:remove']"
    @click="emit('remove')"
  >
    批量删除
  </Button>
</template>
