<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { workflowInstanceInvalid } from '#/api/workflow/instance';

const emit = defineEmits<{ reload: [] }>();

const [BasicModal, modalApi] = useVbenModal({
  onConfirm: handleSubmit,
  onCancel: handleCancel,
  fullscreenButton: false,
  title: '作废原因',
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 80,
  },
  layout: 'vertical',
  schema: [
    {
      fieldName: 'comment',
      label: '作废原因',
      component: 'Textarea',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    data.id = modalApi.getData().id;
    await workflowInstanceInvalid(data as any);
    emit('reload');
    handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}
</script>

<template>
  <BasicModal>
    <BasicForm />
  </BasicModal>
</template>
