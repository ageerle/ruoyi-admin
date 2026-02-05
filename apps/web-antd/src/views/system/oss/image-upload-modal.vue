<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ImageUpload } from '#/components/upload';

const emit = defineEmits<{ reload: [] }>();

const fileList = ref<string[]>([]);
const [BasicModal, modalApi] = useVbenModal({
  onOpenChange: (isOpen) => {
    if (isOpen) {
      return null;
    }
    if (fileList.value.length > 0) {
      fileList.value = [];
      emit('reload');
      modalApi.close();
      return null;
    }
  },
});
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :footer="false"
    :fullscreen-button="false"
    title="图片上传"
  >
    <div class="flex flex-col gap-4">
      <ImageUpload v-model:value="fileList" :max-count="3" />
    </div>
  </BasicModal>
</template>
