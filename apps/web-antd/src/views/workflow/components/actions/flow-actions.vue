<script setup lang="ts">
import type { ApprovalType } from '../type';

import type { User } from '#/api/core/user';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, h } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { cn, getPopupContainer } from '@vben/utils';

import {
  ArrowLeftOutlined,
  CheckOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  RollbackOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { Dropdown, Menu, MenuItem, Modal, Space } from 'ant-design-vue';

import {
  cancelProcessApply,
  deleteByInstanceIds,
} from '#/api/workflow/instance';
import {
  taskOperation,
  terminationTask,
  updateAssignee,
} from '#/api/workflow/task';

import { approvalModal, approvalRejectionModal, flowInterfereModal } from '..';
import { approveWithReasonModal } from '../helper';
import userSelectModal from '../user-select-modal.vue';

interface Props {
  /**
   * 行数据的taskInfo?
   */
  task?: TaskInfo;
  /**
   * 审批类型 根据不同类型显示按钮
   */
  type: ApprovalType;
  /**
   * 为审批类型时候 显示的按钮(按钮权限)
   */
  buttonPermissions: Record<string, boolean>;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  reload: [];
}>();

// 是否显示 `其他` 按钮
const showButtonOther = computed(() => {
  const moreCollections = new Set(['addSign', 'subSign', 'transfer', 'trust']);
  return Object.keys(props.buttonPermissions).some(
    (key) => moreCollections.has(key) && props.buttonPermissions[key],
  );
});

// 进行中 可以撤销
const revocable = computed(() => props.task?.flowStatus === 'waiting');
async function handleCancel() {
  Modal.confirm({
    title: '提示',
    content: '确定要撤销该申请吗？',
    centered: true,
    okButtonProps: { danger: true },
    onOk: async () => {
      await cancelProcessApply({
        businessId: props.task!.businessId,
        message: '申请人撤销流程！',
      });
      emit('reload');
    },
  });
}

/**
 * 是否可编辑/删除
 */
const editableAndRemoveable = computed(() => {
  if (!props.task) {
    return false;
  }
  return ['back', 'cancel', 'draft'].includes(props.task.flowStatus);
});

const router = useRouter();
function handleEdit() {
  const path = props.task?.formPath;
  if (path) {
    router.push({ path, query: { id: props.task!.businessId } });
  }
}

function handleRemove() {
  Modal.confirm({
    title: '提示',
    content: '确定删除该申请吗？',
    centered: true,
    okButtonProps: { danger: true },
    onOk: async () => {
      await deleteByInstanceIds([props.task!.id]);
      emit('reload');
    },
  });
}

/**
 * 审批驳回
 */
const [RejectionModal, rejectionModalApi] = useVbenModal({
  connectedComponent: approvalRejectionModal,
});
function handleRejection() {
  rejectionModalApi.setData({
    taskId: props.task?.id,
    definitionId: props.task?.definitionId,
    nodeCode: props.task?.nodeCode,
  });
  rejectionModalApi.open();
}

/**
 * 审批终止
 */
function handleTermination() {
  approveWithReasonModal({
    title: '审批终止',
    description: '确定终止当前审批流程吗？',
    onOk: async (reason) => {
      await terminationTask({ taskId: props.task!.id, comment: reason });
      emit('reload');
    },
  });
}

/**
 * 审批通过
 */
const [ApprovalModal, approvalModalApi] = useVbenModal({
  connectedComponent: approvalModal,
});
function handleApproval() {
  const { buttonPermissions } = props;
  // 是否具有抄送权限
  const copyPermission = buttonPermissions?.copy ?? false;
  // 是否具有选人权限
  const assignPermission = buttonPermissions?.pop ?? false;
  approvalModalApi.setData({
    taskId: props.task?.id,
    copyPermission,
    assignPermission,
  });
  approvalModalApi.open();
}

/**
 * 委托
 */
const [DelegationModal, delegationModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleDelegation(userList: User[]) {
  if (userList.length === 0) return;
  const current = userList[0];
  approveWithReasonModal({
    title: '委托',
    description: `确定委托给[${current?.nickName}]吗?`,
    onOk: async (reason) => {
      await taskOperation(
        { taskId: props.task!.id, userId: current!.userId, message: reason },
        'delegateTask',
      );
      emit('reload');
    },
  });
}

/**
 * 转办
 */
const [TransferModal, transferModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleTransfer(userList: User[]) {
  if (userList.length === 0) return;
  const current = userList[0];
  approveWithReasonModal({
    title: '转办',
    description: `确定转办给[${current?.nickName}]吗?`,
    onOk: async (reason) => {
      await taskOperation(
        { taskId: props.task!.id, userId: current!.userId, message: reason },
        'transferTask',
      );
      emit('reload');
    },
  });
}

const [AddSignatureModal, addSignatureModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleAddSignature(userList: User[]) {
  if (userList.length === 0) return;
  const userIds = userList.map((user) => user.userId);
  Modal.confirm({
    title: '提示',
    content: '确认加签吗?',
    centered: true,
    onOk: async () => {
      await taskOperation({ taskId: props.task!.id, userIds }, 'addSignature');
      emit('reload');
    },
  });
}

const [ReductionSignatureModal, reductionSignatureModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleReductionSignature(userList: User[]) {
  if (userList.length === 0) return;
  const userIds = userList.map((user) => user.userId);
  Modal.confirm({
    title: '提示',
    content: '确认减签吗?',
    centered: true,
    onOk: async () => {
      await taskOperation(
        { taskId: props.task!.id, userIds },
        'reductionSignature',
      );
      emit('reload');
    },
  });
}

// 流程干预
const [FlowInterfereModal, flowInterfereModalApi] = useVbenModal({
  connectedComponent: flowInterfereModal,
});
function handleFlowInterfere() {
  flowInterfereModalApi.setData({ taskId: props.task?.id });
  flowInterfereModalApi.open();
}

// 修改办理人
const [UpdateAssigneeModal, updateAssigneeModalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});
function handleUpdateAssignee(userList: User[]) {
  if (userList.length === 0) return;
  const current = userList[0];
  if (!current) return;
  Modal.confirm({
    title: '修改办理人',
    content: `确定修改办理人为${current?.nickName}吗?`,
    centered: true,
    onOk: async () => {
      await updateAssignee([props.task!.id], current.userId);
      emit('reload');
    },
  });
}

/**
 * 是否显示 加签/减签操作
 */
const showMultiActions = computed(() => {
  if (!props.task) {
    return false;
  }
  if (Number(props.task.nodeRatio) > 0) {
    return true;
  }
  return false;
});
</script>

<template>
  <div
    :class="
      cn(
        'absolute bottom-0 left-0',
        'border-t-solid border-t-[1px]',
        'bg-background w-full p-3',
      )
    "
  >
    <div class="flex justify-end">
      <Space v-if="type === 'myself'">
        <a-button
          v-if="revocable"
          danger
          ghost
          type="primary"
          :icon="h(RollbackOutlined)"
          @click="handleCancel"
        >
          撤销申请
        </a-button>
        <a-button
          type="primary"
          ghost
          v-if="editableAndRemoveable"
          :icon="h(EditOutlined)"
          @click="handleEdit"
        >
          重新编辑
        </a-button>
        <a-button
          v-if="editableAndRemoveable"
          danger
          ghost
          type="primary"
          :icon="h(EditOutlined)"
          @click="handleRemove"
        >
          删除
        </a-button>
      </Space>
      <Space v-if="type === 'approve'">
        <a-button
          type="primary"
          ghost
          :icon="h(CheckOutlined)"
          @click="handleApproval"
        >
          通过
        </a-button>
        <a-button
          v-if="buttonPermissions?.termination"
          danger
          ghost
          type="primary"
          :icon="h(ExclamationCircleOutlined)"
          @click="handleTermination"
        >
          终止
        </a-button>
        <a-button
          v-if="buttonPermissions?.back"
          danger
          ghost
          type="primary"
          :icon="h(ArrowLeftOutlined)"
          @click="handleRejection"
        >
          驳回
        </a-button>
        <Dropdown
          :get-popup-container="getPopupContainer"
          placement="bottomRight"
        >
          <template #overlay>
            <Menu>
              <MenuItem
                v-if="buttonPermissions?.trust"
                key="1"
                @click="() => delegationModalApi.open()"
              >
                <UserOutlined class="mr-2" />委托
              </MenuItem>
              <MenuItem
                v-if="buttonPermissions?.transfer"
                key="2"
                @click="() => transferModalApi.open()"
              >
                <RollbackOutlined class="mr-2" /> 转办
              </MenuItem>
              <MenuItem
                v-if="showMultiActions && buttonPermissions?.addSign"
                key="3"
                @click="() => addSignatureModalApi.open()"
              >
                <UsergroupAddOutlined class="mr-2" /> 加签
              </MenuItem>
              <MenuItem
                v-if="showMultiActions && buttonPermissions?.subSign"
                key="4"
                @click="() => reductionSignatureModalApi.open()"
              >
                <UsergroupDeleteOutlined class="mr-2" /> 减签
              </MenuItem>
            </Menu>
          </template>
          <a-button v-if="showButtonOther" :icon="h(MenuOutlined)">
            其他
          </a-button>
        </Dropdown>
        <ApprovalModal @complete="$emit('reload')" />
        <RejectionModal @complete="$emit('reload')" />
        <DelegationModal mode="single" @finish="handleDelegation" />
        <TransferModal mode="single" @finish="handleTransfer" />
        <AddSignatureModal mode="multiple" @finish="handleAddSignature" />
        <ReductionSignatureModal
          mode="multiple"
          @finish="handleReductionSignature"
        />
      </Space>
      <Space v-if="type === 'admin'">
        <a-button @click="handleFlowInterfere"> 流程干预 </a-button>
        <a-button @click="() => updateAssigneeModalApi.open()">
          修改办理人
        </a-button>
        <FlowInterfereModal @complete="$emit('reload')" />
        <UpdateAssigneeModal mode="single" @finish="handleUpdateAssignee" />
      </Space>
    </div>
  </div>
</template>
