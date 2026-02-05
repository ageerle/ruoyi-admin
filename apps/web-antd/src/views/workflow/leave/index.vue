<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { LeaveForm } from './api/model';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cancelProcessApply } from '#/api/workflow/instance';
import { commonDownloadExcel } from '#/utils/file/download';

import { applyModal, flowInfoModal } from '../components';
import { leaveExport, leaveList, leaveRemove } from './api';
import { columns, querySchema } from './data';
import { useRouteIdEdit } from './hook';
import leaveDrawer from './leave-drawer.vue';

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
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 选中 需要根据状态判断
    checkMethod: ({ row }) => ['back', 'cancel', 'draft'].includes(row.status),
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await leaveList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  // 表格全局唯一表示 保存列配置需要用到
  id: 'workflow-leave-index',
  cellClassName: ({ row }) => {
    // 草稿状态 可点击
    if (row.status !== 'draft') {
      return 'cursor-pointer';
    }
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    cellClick: ({ row, column }) => {
      // 草稿状态 不做处理
      // 操作列 不做处理
      if (row.status === 'draft' || column.field === 'action') {
        return;
      }
      // 查看详情
      handleInfo(row);
    },
  },
});

const [ApplyModal, applyModalApi] = useVbenModal({
  connectedComponent: applyModal,
});
const [LeaveDrawer, leaveDrawerApi] = useVbenDrawer({
  connectedComponent: leaveDrawer,
});

function handleAdd() {
  leaveDrawerApi.setData({ applyModalApi }).open();
}

async function handleEdit(row: Required<LeaveForm>) {
  leaveDrawerApi.setData({ id: row.id, applyModalApi }).open();
}

useRouteIdEdit((id) => {
  // 打开编辑
  leaveDrawerApi.setData({ id, applyModalApi }).open();
});

async function handleCompleteOrCancel() {
  leaveDrawerApi.close();
  tableApi.query();
}

async function handleDelete(row: Required<LeaveForm>) {
  await leaveRemove(row.id);
  await tableApi.query();
}

async function handleRevoke(row: Required<LeaveForm>) {
  await cancelProcessApply({
    businessId: row.id,
    message: '申请人撤销流程！',
  });
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Required<LeaveForm>) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await leaveRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(
    leaveExport,
    '请假申请数据',
    tableApi.formApi.form.values,
    {
      fieldMappingTime: formOptions.fieldMappingTime,
    },
  );
}
const [FlowInfoModal, flowInfoModalApi] = useVbenModal({
  connectedComponent: flowInfoModal,
});

function handleInfo(row: Required<LeaveForm>) {
  flowInfoModalApi.setData({ businessId: row.id });
  flowInfoModalApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="请假申请列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['workflow:leave:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['workflow:leave:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['workflow:leave:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          :disabled="!['draft', 'cancel', 'back'].includes(row.status)"
          v-access:code="['workflow:leave:edit']"
          @click.stop="handleEdit(row)"
        >
          {{ $t('pages.common.edit') }}
        </a-button>
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          placement="left"
          title="确认撤销？"
          :disabled="!['waiting'].includes(row.status)"
          @confirm.stop="handleRevoke(row)"
          @cancel.stop=""
        >
          <a-button
            size="small"
            type="link"
            :disabled="!['waiting'].includes(row.status)"
            v-access:code="['workflow:leave:edit']"
            @click.stop=""
          >
            撤销
          </a-button>
        </Popconfirm>
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          placement="left"
          title="确认删除？"
          :disabled="!['draft', 'cancel', 'back'].includes(row.status)"
          @confirm.stop="handleDelete(row)"
          @cancel.stop=""
        >
          <a-button
            size="small"
            type="link"
            :disabled="!['draft', 'cancel', 'back'].includes(row.status)"
            danger
            v-access:code="['workflow:leave:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
    <FlowInfoModal />
    <ApplyModal
      @complete="handleCompleteOrCancel"
      @cancel="handleCompleteOrCancel"
    />
    <LeaveDrawer @reload="() => tableApi.query()" />
  </Page>
</template>
