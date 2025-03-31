<script setup lang="ts">
import { ref } from 'vue';

import { JsonPreview, useVbenModal } from '@vben/common-ui';

const data = ref({});
const [BasicModal, modalApi] = useVbenModal({
  title: '流程变量',
  fullscreenButton: false,
  footer: false,
  onOpenChange: (visible) => {
    if (!visible) {
      data.value = {};
      return null;
    }
    const recordString = modalApi.getData().record;
    data.value = JSON.parse(recordString);
  },
});
</script>

<template>
  <BasicModal>
    <div class="min-h-[400px] overflow-y-auto">
      <JsonPreview :data="data" />
    </div>
  </BasicModal>
</template>
