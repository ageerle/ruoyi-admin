<!-- 流程发起(启动)的弹窗 -->

<script setup lang="ts">
import type { CompleteTaskReqData } from '#/api/workflow/task/model';

import { useVbenModal } from '@vben/common-ui';

import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { completeTask, getTaskByTaskId } from '#/api/workflow/task';

import { CopyComponent } from '.';

interface Emits {
  /**
   * 完成
   */
  complete: [];
  /**
   * 取消 此时已经变成草稿状态了
   */
  cancel: [];
}

const emit = defineEmits<Emits>();

interface ModalProps {
  taskId: string;
  taskVariables: Record<string, any>;
  variables?: any; // 这个干啥的
}

const [BasicModal, modalApi] = useVbenModal({
  title: '流程发起',
  fullscreenButton: false,
  onConfirm: handleSubmit,
  onCancel: () => {
    emit('cancel');
    modalApi.close();
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { taskId } = modalApi.getData() as ModalProps;

    // 查询是否有按钮权限
    const resp = await getTaskByTaskId(taskId);
    const buttonPermissions: Record<string, boolean> = {};
    resp.buttonList.forEach((item) => {
      buttonPermissions[item.code] = item.show;
    });

    // 是否具有抄送权限
    const copyPermission = buttonPermissions?.copy ?? false;
    formApi.updateSchema([
      {
        fieldName: 'flowCopyList',
        dependencies: {
          if: copyPermission,
          triggerFields: [''],
        },
      },
    ]);

    modalApi.modalLoading(false);
  },
});

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
      fieldName: 'flowCopyList',
      component: 'Input',
      defaultValue: [],
      label: '抄送人',
      // 默认不显示
      dependencies: {
        if: false,
        triggerFields: [''],
      },
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { messageType, flowCopyList, attachment } = cloneDeep(
      await formApi.getValues(),
    );
    const { taskId, taskVariables, variables } =
      modalApi.getData() as ModalProps;
    // 需要转换数据 抄送人员
    const flowCCList = (flowCopyList as Array<any>).map((item) => ({
      userId: item.userId,
      userName: item.nickName,
    }));
    const requestData = {
      fileId: attachment.join(','),
      messageType,
      flowCopyList: flowCCList,
      taskId,
      taskVariables,
      variables,
    } as CompleteTaskReqData;
    await completeTask(requestData);
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
    <BasicForm>
      <template #flowCopyList="slotProps">
        <CopyComponent v-model:user-list="slotProps.modelValue" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
