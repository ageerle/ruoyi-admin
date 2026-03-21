<!-- 审批驳回窗口 -->
<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { backProcess, getBackTaskNode } from '#/api/workflow/task';

const emit = defineEmits<{ complete: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    // 默认占满两列
    formItemClass: 'col-span-2',
    // 默认label宽度 px
    labelWidth: 100,
    // 通用配置项 会影响到所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      fieldName: 'taskId',
      component: 'Input',
      label: '任务ID',
      dependencies: {
        show: false,
        triggerFields: [''],
      },
    },
    {
      fieldName: 'messageType',
      component: 'CheckboxGroup',
      componentProps: {
        options: [
          { label: '站内信', value: '1', disabled: true },
          { label: '邮件', value: '2' },
          { label: '短信', value: '3' },
        ],
      },
      label: '通知方式',
      defaultValue: ['1'],
    },
    {
      fieldName: 'nodeCode',
      component: 'Select',
      componentProps: {
        getPopupContainer,
      },
      label: '驳回节点',
    },
    {
      fieldName: 'attachment',
      component: 'FileUpload',
      componentProps: {
        maxCount: 10,
        maxSize: 20,
        accept: 'png, jpg, jpeg, doc, docx, xlsx, xls, ppt, pdf',
      },
      defaultValue: [],
      label: '附件上传',
      formItemClass: 'items-start',
    },
    {
      fieldName: 'message',
      component: 'Textarea',
      label: '审批意见',
      formItemClass: 'items-start',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

interface ModalProps {
  taskId: string;
  definitionId: string;
  nodeCode: string;
}

const [BasicModal, modalApi] = useVbenModal({
  title: '审批驳回',
  fullscreenButton: false,
  class: 'min-h-[365px]',
  onConfirm: handleSubmit,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await formApi.resetForm();
      return null;
    }
    modalApi.modalLoading(true);

    const { taskId, nodeCode } = modalApi.getData() as ModalProps;
    await formApi.setFieldValue('taskId', taskId);

    const resp = await getBackTaskNode(taskId, nodeCode);
    const options = resp.map((item) => ({
      label: item.nodeName,
      value: item.nodeCode,
    }));
    formApi.updateSchema([
      {
        fieldName: 'nodeCode',
        componentProps: {
          options,
        },
      },
    ]);
    // 默认选中第一个节点
    if (options.length > 0) {
      formApi.setFieldValue('nodeCode', options[0]?.value);
    }

    modalApi.modalLoading(false);
  },
});

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    // 附件join
    data.fileId = data.attachment?.join?.(',');
    // 取消attachment参数的传递
    data.attachment = undefined;
    await backProcess(data);
    modalApi.close();
    emit('complete');
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
