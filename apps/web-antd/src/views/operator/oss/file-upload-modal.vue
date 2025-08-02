<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Alert } from 'ant-design-vue';

import { FileUpload } from '#/components/upload';

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

const accept = ref(['xlsx', 'word', 'pdf']);
const maxNumber = ref(3);

const message = computed(() => {
  return `支持 [${accept.value.join(', ')}] 格式，最多上传 ${maxNumber.value} 个文件`;
});
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :footer="false"
    :fullscreen-button="false"
    title="文件上传"
  >
    <div class="flex flex-col gap-4">
      <Alert :message="message" show-icon type="info">aaa</Alert>
      <FileUpload
        v-model:value="fileList"
        :accept="accept"
        :max-number="maxNumber"
        :max-size="5"
      />
    </div>
  </BasicModal>
</template>
