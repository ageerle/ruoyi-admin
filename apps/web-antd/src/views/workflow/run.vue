<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Spin, Empty } from 'ant-design-vue';
import { Page } from '@vben/common-ui';

import RunDetail from '#/packages/workflow-designer/components/RunDetail.vue';
import type { WorkflowInfo } from '#/packages/workflow-designer/types/index.d';
import { workflowApi } from '#/api/workflow';

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
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Spin size="large" tip="加载中..." />
    </div>
    <div v-else-if="workflow.uuid" class="p-6 bg-white rounded-lg">
      <RunDetail :workflow="workflow" />
    </div>
    <div v-else class="flex items-center justify-center h-full">
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

