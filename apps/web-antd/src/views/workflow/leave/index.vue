<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { LeaveForm } from './api/model';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { useRouter } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { cancelProcessApply } from '#/api/workflow/instance';
import { commonDownloadExcel } from '#/utils/file/download';

import { flowInfoModal } from '../components';
import { leaveExport, leaveList, leaveRemove } from './api';
import { columns, querySchema } from './data';

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
    // 点击行选中
    // trigger: 'row',
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
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const router = useRouter();
function handleAdd() {
  router.push('/workflow/leaveEdit/index');
}

async function handleEdit(row: Required<LeaveForm>) {
  router.push({ path: '/workflow/leaveEdit/index', query: { id: row.id } });
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
        <Space>
          <ghost-button
            v-if="['draft', 'cancel', 'back'].includes(row.status)"
            v-access:code="['workflow:leave:edit']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认撤销？"
            @confirm="handleRevoke(row)"
          >
            <ghost-button
              v-if="['waiting'].includes(row.status)"
              v-access:code="['workflow:leave:edit']"
              @click.stop=""
            >
              撤销
            </ghost-button>
          </Popconfirm>
          <ghost-button v-if="row.status !== 'draft'" @click="handleInfo(row)">
            详情
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              v-if="['draft', 'cancel', 'back'].includes(row.status)"
              danger
              v-access:code="['workflow:leave:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <FlowInfoModal />
  </Page>
</template>
