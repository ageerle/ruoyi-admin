<script setup lang="ts">
import { Icon } from '@vben/icons';
import { buildUUID } from '@vben/utils';

import { Input } from 'ant-design-vue';

defineOptions({ name: 'SecretInput' });

defineProps({
  disabled: {
    default: false,
    type: Boolean,
  },
  placeholder: {
    default: '请输入密钥或随机生成',
    type: String,
  },
});

const value = defineModel<string>('value', {
  required: false,
  type: String,
});

function refreshSecret() {
  value.value = buildUUID();
}

/**
 * 万一要在每次新增时打开Drawer刷新
 * 需要调用实例方法
 */
defineExpose({ refreshSecret });
</script>

<template>
  <Input v-model:value="value" :disabled="disabled" :placeholder="placeholder">
    <template v-if="!disabled" #addonAfter>
      <a-button type="primary" @click="refreshSecret">
        <div class="flex items-center gap-[4px]">
          <Icon icon="charm:refresh" />
          <span>随机生成</span>
        </div>
      </a-button>
    </template>
  </Input>
</template>

<style lang="scss" scoped>
:deep(.ant-input-group-addon) {
  padding: 0;
  border: none;
}

:deep(.ant-btn-primary) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
