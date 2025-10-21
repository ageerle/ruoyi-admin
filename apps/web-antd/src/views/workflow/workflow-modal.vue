<script setup lang="ts">
import { computed, ref } from 'vue';
import { Form, Input, Switch, message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';

import { workflowApi } from '#/api/workflow';

const emit = defineEmits<{
  (e: 'reload', result: any): void;
}>();

const defaultValues = {
  uuid: '',
  title: '',
  remark: '',
  isPublic: false,
};

const formData = ref({ ...defaultValues });
const isEdit = ref(false);

const title = computed(() => isEdit.value ? '编辑工作流' : '新建工作流');

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[550px]',
  fullscreenButton: false,
  closeOnClickModal: false,
  onClosed: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    
    const data = modalApi.getData() as { uuid?: string; title?: string; remark?: string; isPublic?: boolean };
    isEdit.value = !!data?.uuid;
    
    if (data) {
      formData.value = {
        uuid: data.uuid || '',
        title: data.title || '',
        remark: data.remark || '',
        isPublic: data.isPublic || false,
      };
    } else {
      formData.value = { ...defaultValues };
    }
  },
});

async function handleConfirm() {
  // 表单验证
  if (!formData.value.title || !formData.value.title.trim()) {
    message.error('请输入工作流名称');
    return;
  }

  try {
    modalApi.modalLoading(true);
    
    let result;
    if (isEdit.value) {
      // 编辑模式：更新基本信息
      result = await workflowApi.workflowBaseInfoUpdate({
        uuid: formData.value.uuid,
        title: formData.value.title.trim(),
        remark: formData.value.remark.trim(),
        isPublic: formData.value.isPublic,
      });
    } else {
      // 新建模式：创建新工作流
      result = await workflowApi.workflowAdd({
        title: formData.value.title.trim(),
        remark: formData.value.remark.trim(),
        isPublic: formData.value.isPublic,
      });
    }

    message.success(isEdit.value ? '更新成功' : '创建成功');
    emit('reload', result);
    await handleCancel();
  } catch (error: any) {
    message.error(error.message || (isEdit.value ? '更新失败' : '创建失败'));
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  formData.value = { ...defaultValues };
}
</script>

<template>
  <BasicModal :title="title">
    <Form
      :model="formData"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
    >
      <Form.Item label="工作流名称" required>
        <Input
          v-model:value="formData.title"
          placeholder="请输入工作流名称"
          :maxlength="100"
          show-count
        />
      </Form.Item>

      <Form.Item label="备注说明">
        <Input.TextArea
          v-model:value="formData.remark"
          placeholder="请输入备注说明"
          :rows="3"
          :maxlength="500"
          show-count
        />
      </Form.Item>

      <Form.Item label="是否公开">
        <div class="flex items-center">
          <Switch v-model:checked="formData.isPublic" />
          <span class="ml-2 text-gray-500 text-sm">
            公开后其他用户可以查看和使用
          </span>
        </div>
      </Form.Item>
    </Form>
  </BasicModal>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 20px;
}
</style>

