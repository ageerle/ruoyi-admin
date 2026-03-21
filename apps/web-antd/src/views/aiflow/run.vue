<script setup lang="ts">
import type { WorkflowInfo } from '#/packages/workflow-designer/types/index.d';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Empty, message, Spin } from 'ant-design-vue';

import { workflowApi } from '#/api/aiflow';
import RunDetail from '#/packages/workflow-designer/components/RunDetail.vue';

const router = useRouter();
const route = useRoute();

const workflow = ref<WorkflowInfo>({
  uuid: '',
  title: '工作流运行',
  nodes: [],
  edges: [],
});

const loading = ref(true);

// 加载工作流数据
async function loadWorkflow() {
  const uuid = route.params.uuid as string;
  if (!uuid) {
    message.error('工作流ID不存在');
    router.back();
    return;
  }

  try {
    loading.value = true;
    const data = await workflowApi.workflowGet(uuid);
    workflow.value = data;
  } catch (error: any) {
    message.error(error.message || '加载工作流失败');
    router.back();
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadWorkflow();
});
</script>

<template>
  <Page
    :auto-content-height="true"
    :title="`运行工作流 - ${workflow.title}`"
    :show-back="true"
  >
    <div v-if="loading" class="flex h-full items-center justify-center">
      <Spin size="large" tip="加载中..." />
    </div>
    <div v-else-if="workflow.uuid" class="rounded-lg bg-white p-6">
      <RunDetail :workflow="workflow" />
    </div>
    <div v-else class="flex h-full items-center justify-center">
      <Empty description="工作流加载失败" />
    </div>
  </Page>
</template>

<style scoped>
.workflow-run-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>
