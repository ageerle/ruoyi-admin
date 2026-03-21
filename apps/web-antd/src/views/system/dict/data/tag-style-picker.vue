<script setup lang="ts">
import type { RadioChangeEvent } from 'ant-design-vue';

import { computed } from 'vue';

import { usePreferences } from '@vben/preferences';

import { RadioGroup, Select } from 'ant-design-vue';
import { ColorPicker } from 'vue3-colorpicker';

import { tagSelectOptions } from '#/components/dict';

import 'vue3-colorpicker/style.css';

/**
 * 需要禁止透传
 * 不禁止会有奇怪的bug 会绑定到selectType上
 * TODO: 未知原因 有待研究
 */
defineOptions({ inheritAttrs: false });

defineEmits<{ deselect: [] }>();

const options = [
  { label: '默认颜色', value: 'default' },
  { label: '自定义颜色', value: 'custom' },
] as const;

/**
 * 主要是加了const报错
 */
const computedOptions = computed(
  () => options as unknown as { label: string; value: string }[],
);

type SelectType = (typeof options)[number]['value'];

const selectType = defineModel<SelectType>('selectType', {
  default: 'default',
});

/**
 * color必须为hex颜色或者undefined
 */
const color = defineModel<string | undefined>('value', {
  default: undefined,
});

function handleSelectTypeChange(e: RadioChangeEvent) {
  // 必须给默认hex颜色 不能为空字符串
  color.value = e.target.value === 'custom' ? '#1677ff' : undefined;
}

const { isDark } = usePreferences();
const theme = computed(() => {
  return isDark.value ? 'black' : 'white';
});
</script>

<template>
  <div class="flex flex-1 items-center gap-[6px]">
    <RadioGroup
      v-model:value="selectType"
      :options="computedOptions"
      button-style="solid"
      option-type="button"
      @change="handleSelectTypeChange"
    />
    <Select
      v-if="selectType === 'default'"
      v-model:value="color"
      :allow-clear="true"
      :options="tagSelectOptions()"
      class="flex-1"
      placeholder="请选择标签样式"
      @deselect="$emit('deselect')"
    />
    <ColorPicker
      v-if="selectType === 'custom'"
      disable-alpha
      format="hex"
      v-model:pure-color="color"
      :theme="theme"
    />
  </div>
</template>
