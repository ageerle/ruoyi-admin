<script setup lang="ts">
import type { ResetPwdParam, User } from '#/api/system/user/model';

import { ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { userResetPassword } from '#/api/system/user';

const emit = defineEmits<{ reload: [] }>();

const [BasicModal, modalApi] = useVbenModal({
  onClosed: handleClosed,
  onConfirm: handleSubmit,
  onOpenChange: handleOpenChange,
});

const [BasicForm, formApi] = useVbenForm({
  schema: [
    {
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
      fieldName: 'userId',
      label: '用户ID',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入新的密码, 密码长度为5 - 20',
      },
      fieldName: 'password',
      label: '新的密码',
      rules: z
        .string()
        .min(5, { message: '密码长度为5 - 20' })
        .max(20, { message: '密码长度为5 - 20' }),
    },
  ],
  showDefaultActions: false,
  commonConfig: {
    labelWidth: 80,
  },
});

const currentUser = ref<null | User>(null);
async function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  modalApi.modalLoading(true);

  const { record } = modalApi.getData() as { record: User };
  currentUser.value = record;
  await formApi.setValues({ userId: record.userId });

  modalApi.modalLoading(false);
}

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = await formApi.getValues();
    await userResetPassword(data as ResetPwdParam);
    emit('reload');
    handleClosed();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleClosed() {
  modalApi.close();
  await formApi.resetForm();
  currentUser.value = null;
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :fullscreen-button="false"
    title="重置密码"
  >
    <div class="flex flex-col gap-[12px]">
      <Descriptions v-if="currentUser" size="small" :column="1" bordered>
        <DescriptionsItem label="用户ID">
          {{ currentUser.userId }}
        </DescriptionsItem>
        <DescriptionsItem label="用户名">
          {{ currentUser.userName }}
        </DescriptionsItem>
        <DescriptionsItem label="昵称">
          {{ currentUser.nickName }}
        </DescriptionsItem>
      </Descriptions>
      <BasicForm />
    </div>
  </BasicModal>
</template>
