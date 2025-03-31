<!--
审批详情
约定${task.formPath}/frame 为内嵌表单 用于展示 需要在本地路由添加
apps/web-antd/src/router/routes/workflow-iframe.ts
-->

<script setup lang="ts">
import type { FlowInfoResponse } from '#/api/workflow/instance/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { Divider, Skeleton } from 'ant-design-vue';

import { ApprovalTimeline } from '.';

defineOptions({
  name: 'ApprovalDetails',
  inheritAttrs: false,
});

defineProps<{
  currentFlowInfo: FlowInfoResponse;
  iframeHeight: number;
  iframeLoaded: boolean;
  task: TaskInfo;
}>();
</script>

<template>
  <div>
    <!-- 约定${task.formPath}/frame 为内嵌表单 用于展示 需要在本地路由添加 -->
    <iframe
      v-show="iframeLoaded"
      :src="`${task.formPath}/iframe?readonly=true&id=${task.businessId}`"
      :style="{ height: `${iframeHeight}px` }"
      class="w-full"
    ></iframe>
    <Skeleton v-show="!iframeLoaded" :paragraph="{ rows: 6 }" active />
    <Divider />
    <ApprovalTimeline :list="currentFlowInfo.list" />
  </div>
</template>
