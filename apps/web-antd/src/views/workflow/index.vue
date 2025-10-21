<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { WorkflowInfo } from '#/packages/workflow-designer/types/index.d';

import { Page } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';
import { Modal, Popconfirm, Space, Button } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { workflowApi } from '#/api/workflow';

import { columns, querySchema } from './data';

const router = useRouter();

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await workflowApi.workflowPage({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
        return result;
      },
    },
  },
  rowConfig: {
    keyField: 'uuid',
  },
  id: 'workflow-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

// 新建工作流
async function handleAdd() {
  try {
    const newWorkflow = await workflowApi.workflowUpdate({
      uuid: `workflow-${Date.now()}`,
      title: '新建工作流',
      remark: '',
      isPublic: false,
      nodes: [],
      edges: [],
    });
    
    // 跳转到编辑页面
    router.push({
      name: 'WorkflowEdit',
      params: { uuid: newWorkflow.uuid || newWorkflow.data?.uuid },
    });
  } catch (error: any) {
    Modal.error({
      title: '创建失败',
      content: error.message || '创建工作流失败',
    });
  }
}

// 编辑工作流
function handleEdit(record: WorkflowInfo) {
  router.push({
    name: 'WorkflowEdit',
    params: { uuid: record.uuid },
  });
}

// 运行工作流
function handleRun(record: WorkflowInfo) {
  router.push({
    name: 'WorkflowRun',
    params: { uuid: record.uuid },
  });
}

// 删除工作流
async function handleDelete(row: WorkflowInfo) {
  await workflowApi.workflowDel(row.uuid);
  await tableApi.query();
}

// 批量删除
function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const uuids = rows.map((row: WorkflowInfo) => row.uuid);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${uuids.length}条记录吗？`,
    onOk: async () => {
      await Promise.all(uuids.map((uuid) => workflowApi.workflowDel(uuid)));
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="工作流列表">
      <template #toolbar-tools>
        <Space>
          <Button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            批量删除
          </Button>
          <Button type="primary" @click="handleAdd">
            新建工作流
          </Button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button @click.stop="handleEdit(row)">
            编辑
          </ghost-button>
          <ghost-button @click.stop="handleRun(row)">
            运行
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除该工作流吗？"
            @confirm="handleDelete(row)"
          >
            <ghost-button danger @click.stop="">
              删除
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
  </Page>
</template>
