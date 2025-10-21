<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal, Spin, Empty } from 'ant-design-vue';
import { Page } from '@vben/common-ui';

import WorkflowDesigner from '#/packages/workflow-designer/StandaloneWorkflowDesigner.vue';
import type { WorkflowInfo, WorkflowComponent } from '#/packages/workflow-designer/types/index.d';
import { workflowApi } from '#/api/workflow';

const router = useRouter();
const route = useRoute();

const workflow = ref<WorkflowInfo>({
  uuid: '',
  title: '新建工作流',
  nodes: [],
  edges: [],
});

const wfComponents = ref<WorkflowComponent[]>([]);
const componentIdMap = ref<Record<number, string>>({});
const nameToIdMap = ref<Record<string, number>>({});
const saving = ref(false);
const loading = ref(true);

// 页面标题
const pageTitle = computed(() => {
  return workflow.value.title || '工作流编辑';
});

// 获取工作流组件列表
async function fetchWorkflowComponents() {
  try {
    const res = await workflowApi.workflowComponents();
    wfComponents.value = res || [];
    generateComponentIdMap();
  } catch (error) {
    message.error('获取工作流组件失败');
    wfComponents.value = [
      { name: 'Start', title: '开始' },
      { name: 'End', title: '结束' },
      { name: 'Answer', title: '回答' },
    ];
    generateComponentIdMap();
  }
}

// 根据组件列表生成ID映射
function generateComponentIdMap() {
  const map: Record<number, string> = {};
  
  wfComponents.value.forEach((component, index) => {
    const id = (component as any).id ?? index;
    map[id] = component.name;
  });
  
  if (Object.keys(map).length === 0) {
    map[0] = 'Start';
    map[1] = 'End';
    map[2] = 'Answer';
  }
  
  componentIdMap.value = map;
  nameToIdMap.value = Object.fromEntries(
    Object.entries(map).map(([id, name]) => [name, Number(id)])
  );
}

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

// 保存工作流
async function handleSave(updated: WorkflowInfo) {
  if (saving.value) return;
  
  saving.value = true;
  try {
    // 设置 workflowComponentId
    updated.nodes.forEach((node) => {
      if (node.wfComponent) {
        node.workflowComponentId = nameToIdMap.value[node.wfComponent?.name || ''] ?? 0;
      }
      if (node.nodeConfig === undefined) {
        node.nodeConfig = {};
      }
    });

    await workflowApi.workflowUpdate({
      uuid: updated.uuid,
      title: updated.title,
      remark: (updated as any).remark ?? '',
      isPublic: (updated as any).isPublic ?? false,
      nodes: updated.nodes || [],
      edges: updated.edges || [],
    });

    message.success('保存成功');
    
    // 保存成功后返回列表页
    router.push({ name: 'Workflow' });
  } catch (error: any) {
    message.error(error.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

// 取消编辑
function handleCancel() {
  Modal.confirm({
    title: '提示',
    content: '确定要取消编辑吗？未保存的修改将丢失。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      router.push({ name: 'Workflow' });
    },
  });
}

// 运行工作流（暂不实现，跳转到运行页面）
function handleRun() {
  Modal.warning({
    title: '提示',
    content: '请先保存工作流后再运行',
  });
}

onMounted(async () => {
  await fetchWorkflowComponents();
  await loadWorkflow();
});
</script>

<template>
  <Page 
    :auto-content-height="true" 
    :title="pageTitle"
    :show-back="true"
    @back="handleCancel"
  >
    <div v-if="loading" class="flex items-center justify-center h-full">
      <Spin size="large" tip="加载中..." />
    </div>
    <div v-else-if="workflow.uuid" class="workflow-edit-page">
      <WorkflowDesigner 
        :workflow="workflow" 
        :wf-components="wfComponents" 
        :component-id-map="componentIdMap"
        :saving="saving"
        @save="handleSave" 
        @run="handleRun" 
      />
    </div>
    <div v-else class="flex items-center justify-center h-full">
      <Empty description="工作流加载失败" />
    </div>
  </Page>
</template>

<style scoped>
.workflow-edit-page {
  width: 100%;
  height: calc(100vh - 120px);
  overflow: hidden;
}
</style>

