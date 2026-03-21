<!--
TODO: 优化项
会先加载流程信息 再加载业务表单信息
-->
<script setup lang="ts">
import type { ApprovalType } from './type';

import type { FlowInfoResponse } from '#/api/workflow/instance/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, ref, watch } from 'vue';

import { Fallback, VbenAvatar } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';
import { cn } from '@vben/utils';

import { CopyOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import { Card, Divider, message, TabPane, Tabs } from 'ant-design-vue';

import { flowInfo } from '#/api/workflow/instance';
import { getTaskByTaskId } from '#/api/workflow/task';
import { renderDict } from '#/utils/render';

import { FlowActions } from './actions';
import ApprovalDetails from './approval-details.vue';
import FlowPreview from './flow-preview.vue';

defineOptions({
  name: 'ApprovalPanel',
  inheritAttrs: false,
});

const props = defineProps<Props>();

/**
 * 下面按钮点击后会触发的事件
 */
defineEmits<{ reload: [] }>();

interface Props {
  /**
   * 行数据(list)的info
   */
  task?: TaskInfo;
  /**
   * 审批类型
   */
  type: ApprovalType;
}

/**
 * 目前的作用只为了获取按钮权限 因为list接口(行数据)获取为空
 */
const onlyForBtnPermissionTask = ref<TaskInfo>();
/**
 * 按钮权限
 */
const buttonPermissions = computed(() => {
  const record: Record<string, boolean> = {};
  if (!onlyForBtnPermissionTask.value) {
    return record;
  }
  onlyForBtnPermissionTask.value.buttonList.forEach((item) => {
    record[item.code] = item.show;
  });
  return record;
});

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

async function handleLoadInfo(task: TaskInfo | undefined) {
  if (!task) {
    return null;
  }
  try {
    loading.value = true;

    /**
     * 不为审批不需要调用`getTaskByTaskId`接口
     */
    if (props.type !== 'approve') {
      const flowResp = await flowInfo(task.businessId);
      currentFlowInfo.value = flowResp;
      return;
    }

    /**
     * getTaskByTaskId主要为了获取按钮权限 目前没有其他功能
     * 行数据(即props.task)获取的是没有按钮权限的
     */
    const [flowResp, taskResp] = await Promise.all([
      flowInfo(task.businessId),
      getTaskByTaskId(task.id),
    ]);

    currentFlowInfo.value = flowResp;
    onlyForBtnPermissionTask.value = taskResp;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

watch(() => props.task, handleLoadInfo);

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
  <div :class="cn('thin-scrollbar', 'flex flex-1 overflow-y-hidden')">
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
            <div class="text-2xl font-bold">
              {{ task.businessTitle ?? task.flowName }}
            </div>
            <div>
              <component
                :is="renderDict(task.flowStatus, DictEnum.WF_BUSINESS_STATUS)"
              />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <VbenAvatar
              :alt="task?.createByName ?? ''"
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
              :task="task"
            />
          </TabPane>

          <TabPane key="2" tab="审批流程图">
            <FlowPreview :instance-id="currentFlowInfo.instanceId" />
          </TabPane>
        </Tabs>
      </div>

      <!-- 固定底部 占位高度 -->
      <div class="h-[58px]"></div>
      <FlowActions
        v-if="showFooter"
        :type="type"
        :task="task"
        :button-permissions="buttonPermissions"
        @reload="$emit('reload')"
      />
    </Card>

    <slot v-else name="empty">
      <Fallback title="点击左侧选择" />
    </slot>
  </div>
</template>
