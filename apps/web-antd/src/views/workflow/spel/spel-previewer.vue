<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  componentName?: string;
  methodName?: string;
  methodParams?: string;
}

const props = defineProps<Props>();

const text = computed(() => {
  const { componentName, methodName, methodParams } = props;
  if (!componentName || !methodName) {
    return '-';
  }

  const params = methodParams ? methodParams.split(',') : [];
  const methodParamsText = params.map((item) => `#${item}`).join(',');

  return `#{@${componentName}.${methodName}(${methodParamsText})}`;
});
</script>

<template>
  <div class="w-full break-all rounded-[4px] bg-[black]/5 p-2">{{ text }}</div>
</template>
