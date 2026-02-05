<!-- 审批终止 Modal弹窗的content属性专用 用于填写审批意见 -->
<script setup lang="ts">
import { Textarea } from 'ant-design-vue';

defineOptions({
  name: 'ApprovalContent',
  inheritAttrs: false,
});

defineProps<{ description: string; value: string }>();

defineEmits<{ 'update:value': [string] }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>{{ description }}</div>
    <Textarea
      :allow-clear="true"
      :auto-size="true"
      :value="value"
      placeholder="审批意见(可选)"
      @change="(e) => $emit('update:value', e.target.value!)"
    />
  </div>
</template>
