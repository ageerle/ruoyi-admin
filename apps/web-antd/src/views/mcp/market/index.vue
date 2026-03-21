<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { McpMarket } from '#/api/mcp/market/model';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space, message } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  mcpMarketChangeStatus,
  mcpMarketExport,
  mcpMarketList,
  mcpMarketRefresh,
  mcpMarketRemove,
} from '#/api/mcp/market';
import { TableSwitch } from '#/components/table';
import { commonDownloadExcel } from '#/utils/file/download';

import marketDrawer from './market-drawer.vue';
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
        return await mcpMarketList({
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
  id: 'mcp-market-index',
  showOverflow: false,
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [MarketDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: marketDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: McpMarket) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: McpMarket) {
  await mcpMarketRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: McpMarket) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await mcpMarketRemove(ids);
      await tableApi.query();
    },
  });
}

async function handleRefresh(row: McpMarket) {
  try {
    const result = await mcpMarketRefresh(row.id);
    message.success(`刷新成功，新增 ${result.addedCount} 个工具，更新 ${result.updatedCount} 个工具`);
    await tableApi.query();
  } catch (error) {
    message.error('刷新失败');
  }
}

function handleDownloadExcel() {
  commonDownloadExcel(mcpMarketExport, 'MCP市场数据', tableApi.formApi.form.values);
}

const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="MCP市场列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['mcp:market:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['mcp:market:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['mcp:market:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <TableSwitch
          v-model:value="row.status"
          :api="() => mcpMarketChangeStatus(row)"
          :disabled="!hasAccessByCodes(['mcp:market:edit'])"
          :checked-value="'ENABLED'"
          :unchecked-value="'DISABLED'"
          @reload="tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['mcp:market:edit']"
            @click.stop="handleRefresh(row)"
          >
            刷新
          </ghost-button>
          <ghost-button
            v-access:code="['mcp:market:edit']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['mcp:market:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <MarketDrawer @reload="tableApi.query()" />
  </Page>
</template>
