<!-- 该文件需要重构 但我没空 -->
<script setup lang="ts">
import type { User } from '#/api/core/user';
import type { FlowInfoResponse } from '#/api/workflow/instance/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Fallback, useVbenModal, VbenAvatar } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { CopyOutlined } from '@ant-design/icons-vue';
import { useClipboard, useEventListener } from '@vueuse/core';
import {
  Card,
  Divider,
  Dropdown,
  Menu,
  MenuItem,
  message,
  Modal,
  Space,
  TabPane,
  Tabs,
} from 'ant-design-vue';
import { isObject } from 'lodash-es';

import {
  cancelProcessApply,
  deleteByInstanceIds,
  flowInfo,
} from '#/api/workflow/instance';
import {
  getTaskByTaskId,
  taskOperation,
  terminationTask,
  updateAssignee,
} from '#/api/workflow/task';
import { renderDict } from '#/utils/render';

import { approvalModal, approvalRejectionModal, flowInterfereModal } from '.';
import ApprovalDetails from './approval-details.vue';
import { approveWithReasonModal } from './helper';
import userSelectModal from './user-select-modal.vue';

defineOptions({
  name: 'ApprovalPanel',
  inheritAttrs: false,
});

// eslint-disable-next-line no-use-before-define
const props = defineProps<{ task?: TaskInfo; type: ApprovalType }>();

/**
 * 下面按钮点击后会触发的事件
 */
const emit = defineEmits<{ reload: [] }>();

const currentTask = ref<TaskInfo>();
/**
 * 是否显示 加签/减签操作
 */
const showMultiActions = computed(() => {
  if (!currentTask.value) {
    return false;
  }
  if (Number(currentTask.value.nodeRatio) > 0) {
    return true;
  }
  return false;
});

/**
 * 按钮权限
 */
const buttonPermissions = computed(() => {
  const record: Record<string, boolean> = {};
  if (!currentTask.value) {
    return record;
  }
  currentTask.value.buttonList.forEach((item) => {
    record[item.code] = item.show;
  });
  return record;
});

// 是否显示 `其他` 按钮
const showButtonOther = computed(() => {
  const moreCollections = new Set(['addSign', 'subSign', 'transfer', 'trust']);
  return Object.keys(buttonPermissions.value).some(
    (key) => moreCollections.has(key) && buttonPermissions.value[key],
  );
});

/**
 * myself 我发起的
 * readonly 只读 只用于查看
 * approve 审批
 * admin 流程监控 - 待办任务使用
 */
type ApprovalType = 'admin' | 'approve' | 'myself' | 'readonly';
const showFooter = computed(() => {
  if (props.type === 'readonly') {
    return false;
  }
  // 我发起的 && [已完成, 已作废] 不显示
  if (
    props.type === 'myself' &&
    ['finish', 'invalid'].includes(props.task?.flowStatus ?? '')
  ) {
    return false;
  }
  return true;
});

const currentFlowInfo = ref<FlowInfoResponse>();
/**
 * card的loading状态
 */
const loading = ref(false);
const iframeLoaded = ref(false);
const iframeHeight = ref(300);
useEventListener('message', (event) => {
  const data = event.data as { [key: string]: any; type: string };
  if (!isObject(data)) return;
  /**
   * iframe通信 加载完毕后才显示表单 解决卡顿问题
   */
  if (data.type === 'mounted') {
    iframeLoaded.value = true;
  }
  /**
   * 高度与表单高度保持一致
   */
  if (data.type === 'height') {
    const height = data.height;
    iframeHeight.value = height;
  }
});

async function handleLoadInfo(task: TaskInfo | undefined) {
  try {
    if (!task) return null;
    loading.value = true;
    iframeLoaded.value = false;
    const resp = await flowInfo(task.businessId);
    currentFlowInfo.value = resp;

    const taskResp = await getTaskByTaskId(props.task!.id);
    currentTask.value = taskResp;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

watch(() => props.task, handleLoadInfo);

onUnmounted(() => (currentFlowInfo.value = undefined));

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
  // 是否具有抄送权限
  const copyPermission = buttonPermissions.value?.copy ?? false;
  // 是否具有选人权限
  const assignPermission = buttonPermissions.value?.pop ?? false;
  approvalModalApi.setData({
    taskId: props.task?.id,
    copyPermission,
    assignPermission,
  });
  approvalModalApi.open();
}

/**
 * TODO: 1提取公共函数 2原版是可以填写意见的(message参数)
 */

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
 * 不加legacy在本地开发没有问题
 * 打包后在一些设备会无法复制 使用legacy来保证兼容性
 */
const { copy } = useClipboard({ legacy: true });
async function handleCopy(text: string) {
  await copy(text);
  message.success('复制成功');
}
</script>

<template>
  <Card
    v-if="task"
    :body-style="{ overflowY: 'auto', height: '100%' }"
    :loading="loading"
    class="thin-scrollbar flex-1 overflow-y-hidden"
    size="small"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <div>编号: {{ task.id }}</div>
        <CopyOutlined class="cursor-pointer" @click="handleCopy(task.id)" />
      </div>
    </template>
    <template #extra>
      <a-button size="small" @click="() => handleLoadInfo(task)">
        <div class="flex items-center justify-center">
          <span class="icon-[material-symbols--refresh] size-24px"></span>
        </div>
      </a-button>
    </template>
    <div class="flex flex-col gap-5 p-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <div class="text-2xl font-bold">{{ task.flowName }}</div>
          <div>
            <component
              :is="renderDict(task.flowStatus, DictEnum.WF_BUSINESS_STATUS)"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <VbenAvatar
            :alt="task.createByName"
            class="bg-primary size-[28px] rounded-full text-white"
            src=""
          />
          <span>{{ task.createByName }}</span>
          <div class="flex items-center opacity-50">
            <div class="flex items-center gap-1">
              <span class="icon-[bxs--category-alt] size-[16px]"></span>
              流程分类: {{ task.categoryName }}
            </div>
            <Divider type="vertical" />
            <div class="flex items-center gap-1">
              <span class="icon-[mdi--clock-outline] size-[16px]"></span>
              提交时间: {{ task.createTime }}
            </div>
          </div>
        </div>
      </div>
      <Tabs v-if="currentFlowInfo" class="flex-1">
        <TabPane key="1" tab="审批详情">
          <ApprovalDetails
            :current-flow-info="currentFlowInfo"
            :iframe-loaded="iframeLoaded"
            :iframe-height="iframeHeight"
            :task="task"
          />
        </TabPane>
        <TabPane key="2" tab="审批流程图">
          <img
            :src="`data:image/png;base64,${currentFlowInfo.image}`"
            class="rounded-lg border"
          />
        </TabPane>
      </Tabs>
    </div>
    <!-- 固定底部 -->
    <div class="h-[57px]"></div>
    <div
      v-if="showFooter"
      class="border-t-solid bg-background absolute bottom-0 left-0 w-full border-t-[1px] p-3"
    >
      <div class="flex justify-end">
        <Space v-if="type === 'myself'">
          <a-button
            v-if="revocable"
            danger
            type="primary"
            @click="handleCancel"
          >
            撤销申请
          </a-button>
          <a-button v-if="editableAndRemoveable" @click="handleEdit">
            重新编辑
          </a-button>
          <a-button
            v-if="editableAndRemoveable"
            danger
            type="primary"
            @click="handleRemove"
          >
            删除
          </a-button>
        </Space>
        <Space v-if="type === 'approve'">
          <a-button type="primary" @click="handleApproval">通过</a-button>
          <a-button
            v-if="buttonPermissions?.termination"
            danger
            type="primary"
            @click="handleTermination"
          >
            终止
          </a-button>
          <a-button
            v-if="buttonPermissions?.back"
            danger
            type="primary"
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
                  委托
                </MenuItem>
                <MenuItem
                  v-if="buttonPermissions?.transfer"
                  key="2"
                  @click="() => transferModalApi.open()"
                >
                  转办
                </MenuItem>
                <MenuItem
                  v-if="showMultiActions && buttonPermissions?.addSign"
                  key="3"
                  @click="() => addSignatureModalApi.open()"
                >
                  加签
                </MenuItem>
                <MenuItem
                  v-if="showMultiActions && buttonPermissions?.subSign"
                  key="4"
                  @click="() => reductionSignatureModalApi.open()"
                >
                  减签
                </MenuItem>
              </Menu>
            </template>
            <a-button v-if="showButtonOther"> 其他 </a-button>
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
  </Card>
  <Fallback v-else title="点击左侧选择" />
</template>
