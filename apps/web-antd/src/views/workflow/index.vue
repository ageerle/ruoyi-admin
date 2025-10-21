<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { WorkflowInfo } from '#/packages/workflow-designer/types/index.d';

import { Page, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';
import { Modal, Popconfirm, Space, Button } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { workflowApi } from '#/api/workflow';

import { columns, querySchema } from './data';
import WorkflowModal from './workflow-modal.vue';

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

const [WorkflowModalComponent, workflowModalApi] = useVbenModal({
  connectedComponent: WorkflowModal,
});

// 新建工作流
function handleAdd() {
  workflowModalApi.setData({});
  workflowModalApi.open();
}

// 编辑工作流基本信息
function handleEditInfo(record: WorkflowInfo) {
  workflowModalApi.setData({
    uuid: record.uuid,
    title: record.title,
    remark: record.remark,
    isPublic: record.isPublic,
  });
  workflowModalApi.open();
}

// Modal操作成功回调
async function handleReload(result?: any) {
  // 判断是新建还是编辑
  const data = workflowModalApi.getData() as { uuid?: string };
  const isEdit = data?.uuid;
  
  if (isEdit) {
    // 编辑模式：刷新列表
    await tableApi.query();
  } else {
    // 新建模式：跳转到编辑页面
    const uuid = result?.data?.uuid || result?.uuid;
    if (uuid) {
      router.push({
        name: 'WorkflowEdit',
        params: { uuid },
      });
    } else {
      await tableApi.query();
    }
  }
}

// 进入编辑器
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
          <ghost-button @click.stop="handleEditInfo(row)">
            信息
          </ghost-button>
          <ghost-button @click.stop="handleEdit(row)">
            设计
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
    <WorkflowModalComponent @reload="handleReload" />
  </Page>
</template>
