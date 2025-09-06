<template>
  <BasicModal :title="title">
    <BasicForm />
  </BasicModal>
</template>

<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import { computed, ref } from 'vue';

import { useVbenForm, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { mcpInfoAdd, mcpInfoInfo, mcpInfoUpdate } from '#/api/operator/mcpInfo';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[600px]',
  fullscreenButton: false,
  closeOnClickModal: false,
  onClosed: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await mcpInfoInfo(id);
      formApi.setValues(record);
    } else {
      formApi.resetForm();
    }

    modalApi.modalLoading(false);
  },
});

const [BasicForm, formApi] = useVbenForm({
  schema: modalSchema(),
  commonConfig: {
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-2',
  showDefaultActions: false,
} as VbenFormProps);

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    const values = await formApi.submitForm();
    await (isUpdate.value ? mcpInfoUpdate(values) : mcpInfoAdd(values));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  await modalApi.close();
  formApi.resetForm();
}
</script>
