<script setup lang="ts">
import type { User } from '#/api/system/user/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Modal } from 'ant-design-vue';

import {
  getTaskByTaskId,
  taskOperation,
  terminationTask,
} from '#/api/workflow/task';

import { userSelectModal } from '.';

const emit = defineEmits<{ complete: [] }>();

const taskInfo = ref<TaskInfo>();

/**
 * 是否显示 加签/减签操作
 */
const showMultiActions = computed(() => {
  if (!taskInfo.value) {
    return false;
  }
  if (Number(taskInfo.value.nodeRatio) > 0) {
    return true;
  }
  return false;
});

const [BasicModal, modalApi] = useVbenModal({
  title: '流程干预',
  class: 'w-[800px]',
  fullscreenButton: false,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    const { taskId } = modalApi.getData() as { taskId: string };
    taskInfo.value = await getTaskByTaskId(taskId);
  },
});

/**
 * 转办
 */
const [TransferModal, transferModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleTransfer(userList: User[]) {
  if (userList.length === 0 || !taskInfo.value) return;
  const current = userList[0];
  Modal.confirm({
    title: '转办',
    content: `确定转办给${current?.nickName}吗?`,
    centered: true,
    onOk: async () => {
      await taskOperation(
        { taskId: taskInfo.value!.id, userId: current!.userId },
        'transferTask',
      );
      emit('complete');
    },
  });
}

/**
 * 审批终止
 */
function handleTermination() {
  if (!taskInfo.value) {
    return;
  }
  Modal.confirm({
    title: '审批终止',
    content: '确定终止当前审批流程吗？',
    centered: true,
    okButtonProps: { danger: true },
    onOk: async () => {
      await terminationTask({ taskId: taskInfo.value!.id });
      emit('complete');
    },
  });
}

const [AddSignatureModal, addSignatureModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleAddSignature(userList: User[]) {
  if (userList.length === 0 || !taskInfo.value) return;
  const userIds = userList.map((user) => user.userId);
  Modal.confirm({
    title: '提示',
    content: '确认加签吗?',
    centered: true,
    onOk: async () => {
      await taskOperation(
        { taskId: taskInfo.value!.id, userIds },
        'addSignature',
      );
      emit('complete');
    },
  });
}

const [ReductionSignatureModal, reductionSignatureModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleReductionSignature(userList: User[]) {
  if (userList.length === 0 || !taskInfo.value) return;
  const userIds = userList.map((user) => user.userId);
  Modal.confirm({
    title: '提示',
    content: '确认减签吗?',
    centered: true,
    onOk: async () => {
      await taskOperation(
        { taskId: taskInfo.value!.id, userIds },
        'reductionSignature',
      );
      emit('complete');
    },
  });
}
</script>

<template>
  <BasicModal>
    <Descriptions v-if="taskInfo" :column="2" bordered size="small">
      <DescriptionsItem label="任务名称">
        {{ taskInfo.nodeName }}
      </DescriptionsItem>
      <DescriptionsItem label="节点编码">
        {{ taskInfo.nodeCode }}
      </DescriptionsItem>
      <DescriptionsItem label="开始时间">
        {{ taskInfo.createTime }}
      </DescriptionsItem>
      <DescriptionsItem label="流程实例ID">
        {{ taskInfo.instanceId }}
      </DescriptionsItem>
      <DescriptionsItem label="版本号">
        {{ taskInfo.version }}
      </DescriptionsItem>
      <DescriptionsItem label="业务ID">
        {{ taskInfo.businessId }}
      </DescriptionsItem>
    </Descriptions>
    <TransferModal mode="single" @finish="handleTransfer" />
    <AddSignatureModal mode="multiple" @finish="handleAddSignature" />
    <ReductionSignatureModal
      mode="multiple"
      @finish="handleReductionSignature"
    />
    <template #footer>
      <template v-if="showMultiActions">
        <a-button @click="() => addSignatureModalApi.open()">加签</a-button>
        <a-button @click="() => reductionSignatureModalApi.open()">
          减签
        </a-button>
      </template>
      <a-button @click="() => transferModalApi.open()">转办</a-button>
      <a-button danger type="primary" @click="handleTermination">终止</a-button>
    </template>
  </BasicModal>
</template>
