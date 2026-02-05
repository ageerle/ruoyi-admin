<!-- 审批同意的弹窗 -->
<script setup lang="ts">
import type { User } from '#/api/system/user/model';
import type {
  CompleteTaskReqData,
  NextNodeInfo,
} from '#/api/workflow/task/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { message } from 'ant-design-vue';
import { omit } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { completeTask, getNextNodeList } from '#/api/workflow/task';

import { CopyComponent } from '.';

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
    },
    {
      fieldName: 'assigneeMap',
      component: 'Input',
      label: '下一步审批人',
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
  // 是否具有抄送权限
  copyPermission: boolean;
  // 是有具有选人权限
  assignPermission: boolean;
}

// 自定义添加选人属性 给组件v-for绑定
const nextNodeInfo = ref<(NextNodeInfo & { selectUserList: User[] })[]>([]);
const [BasicModal, modalApi] = useVbenModal({
  title: '审批通过',
  fullscreenButton: false,
  class: 'min-h-[365px]',
  onConfirm: handleSubmit,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      await formApi.resetForm();
      return null;
    }
    modalApi.modalLoading(true);

    const { taskId, copyPermission, assignPermission } =
      modalApi.getData() as ModalProps;
    // 是否显示抄送选择
    formApi.updateSchema([
      {
        fieldName: 'flowCopyList',
        dependencies: {
          if: copyPermission,
          triggerFields: [''],
        },
      },
      {
        fieldName: 'assigneeMap',
        dependencies: {
          if: assignPermission,
          triggerFields: [''],
        },
      },
    ]);

    // 获取下一节点名称
    if (assignPermission) {
      const resp = await getNextNodeList({ taskId });
      nextNodeInfo.value = resp.map((item) => ({
        ...item,
        // 用于给组件绑定
        selectUserList: [],
      }));
    }

    await formApi.setFieldValue('taskId', taskId);

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
    // 需要转换数据 抄送人员
    const flowCopyList = (data.flowCopyList as Array<any>).map((item) => ({
      userId: item.userId,
      userName: item.nickName,
    }));
    const requestData = {
      ...omit(data, ['attachment']),
      fileId: data.attachment.join(','),
      taskVariables: {},
      variables: {},
      flowCopyList,
    } as CompleteTaskReqData;

    // 选人
    if (modalApi.getData()?.assignPermission) {
      // 判断是否选中
      for (const item of nextNodeInfo.value) {
        if (item.selectUserList.length === 0) {
          message.warn(`未选择节点[${item.nodeName}]审批人`);
          return;
        }
      }

      const assigneeMap: { [key: string]: string } = {};
      nextNodeInfo.value.forEach((item) => {
        assigneeMap[item.nodeCode] = item.selectUserList
          .map((u) => u.userId)
          .join(',');
      });
      requestData.assigneeMap = assigneeMap;
    }

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
      <template #assigneeMap>
        <div
          v-for="item in nextNodeInfo"
          :key="item.nodeCode"
          class="flex items-center gap-2"
        >
          <template v-if="item.permissionFlag">
            <span class="opacity-70">{{ item.nodeName }}</span>
            <CopyComponent
              :allow-user-ids="item.permissionFlag"
              v-model:user-list="item.selectUserList"
            />
          </template>
          <template v-else>
            <span class="text-red-500">没有权限, 请联系管理员</span>
          </template>
        </div>
      </template>
    </BasicForm>
  </BasicModal>
</template>
