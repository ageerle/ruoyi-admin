<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import {
  graphInstanceAdd,
  graphInstanceInfo,
  graphInstanceUpdate,
} from '#/api/graph';

import { formSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑图谱实例' : '新建图谱实例';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 100,
  },
  schema: formSchema(),
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await graphInstanceInfo(id);

      // 处理数组字段
      const formData: any = {
        ...record,
        entityTypes: record.entityTypes ? record.entityTypes.split(',') : [],
        relationTypes: record.relationTypes
          ? record.relationTypes.split(',')
          : [],
      };

      // 设置表单值
      await formApi.setValues(formData);
    } else {
      // 新建时，初始化数组字段为空数组
      await formApi.setFieldValue('entityTypes', []);
      await formApi.setFieldValue('relationTypes', []);
    }

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const values = cloneDeep(await formApi.getValues());

    // 处理数组字段
    const data: any = {
      ...values,
      entityTypes: Array.isArray(values.entityTypes)
        ? values.entityTypes.join(',')
        : values.entityTypes,
      relationTypes: Array.isArray(values.relationTypes)
        ? values.relationTypes.join(',')
        : values.relationTypes,
    };

    await (isUpdate.value ? graphInstanceUpdate(data) : graphInstanceAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicModal :close-on-click-modal="false" :title="title" class="w-[650px]">
    <BasicForm />
  </BasicModal>
</template>
