<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Alert } from 'ant-design-vue';

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

const accept = ref(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const maxNumber = ref(3);

const message = computed(() => {
  return `支持 [${accept.value.join(', ')}] 格式，最多上传 ${maxNumber.value} 张图片`;
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
      <Alert :message="message" show-icon type="info">aaa</Alert>
      <ImageUpload
        v-model:value="fileList"
        :accept="accept"
        :max-number="maxNumber"
      />
    </div>
  </BasicModal>
</template>
