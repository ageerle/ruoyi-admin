

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Form, Input, Switch, message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';

import { workflowApi } from '#/api/aiflow';
const defaultValues = {
  uuid: '',
  name: '',
  title: '',
  remark:'',
  isEnable: true,
};
const formData = ref({ ...defaultValues });
const isEdit = ref(false);
const title = '新增节点';
const emit = defineEmits<{
  (e: 'reload', result: any): void;
}>();

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

    const data = modalApi.getData() as {
      uuid?: string;
      name?: string;
      title?: string;
      remark?: string;
      isEnable?: boolean;
    };
    isEdit.value = !!data?.uuid;

    if (data) {
      formData.value = {
        uuid: data.uuid || '',
        name: data.name || '',
        title: data.title || '',
        remark: data.remark || '',
        isEnable: data.isEnable || true,
      };
    } else {
      formData.value = { ...defaultValues };
    }
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);

    let result;
    if (isEdit.value) {
      // 编辑模式：更新基本信息
      result = await workflowApi.addNode({
        uuid: formData.value.uuid,
        name: formData.value.name.trim(),
        title: formData.value.title.trim(),
        remark: formData.value.remark.trim(),
        isEnable: formData.value.isEnable,
      });
    } else {
      // 新建模式：创建新工作流
      result = await workflowApi.addNode({
        name: formData.value.name.trim(),
        title: formData.value.title.trim(),
        remark: formData.value.remark.trim(),
        isEnable: formData.value.isEnable,
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
      <Form.Item label="组件名称" required>
        <Input
          v-model:value="formData.name"
          placeholder="请输入组件名称"
          :maxlength="100"
          show-count
        />
      </Form.Item>
       <Form.Item label="组件标题" required>
        <Input
          v-model:value="formData.title"
          placeholder="请输入组件标题"
          :maxlength="100"
          show-count
        />
      </Form.Item>
          <Form.Item label="备注" required>
        <Input
          v-model:value="formData.remark"
          placeholder="请输入备注"
          :maxlength="100"
          show-count
        />
      </Form.Item>
       <Form.Item label="是否启用">
        <div class="flex items-center">
          <Switch v-model:checked="formData.isEnable" />
          
        </div>
      </Form.Item>
      </Form>
  </BasicModal>
</template>
