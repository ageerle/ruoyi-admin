<!-- 弹窗查看流程信息 -->
<script setup lang="ts">
import type { TaskInfo } from '#/api/workflow/task/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { getTaskByBusinessId } from '#/api/workflow/instance';

import { ApprovalPanel } from '.';

interface ModalProps {
  businessId: string;
}

const taskInfo = ref<TaskInfo>();

const [BasicModal, modalApi] = useVbenModal({
  title: '流程信息',
  class: 'w-[1000px]',
  footer: false,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    const { businessId } = modalApi.getData() as ModalProps;
    const taskResp = await getTaskByBusinessId(businessId);
    taskInfo.value = taskResp;
  },
});
</script>

<template>
  <BasicModal>
    <ApprovalPanel :task="taskInfo" type="readonly" />
  </BasicModal>
</template>
