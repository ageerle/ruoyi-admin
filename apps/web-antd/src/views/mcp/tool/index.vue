<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { McpTool } from '#/api/mcp/tool/model';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space, message } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  mcpToolChangeStatus,
  mcpToolExport,
  mcpToolList,
  mcpToolRemove,
  mcpToolTest,
} from '#/api/mcp/tool';
import { TableSwitch } from '#/components/table';
import { commonDownloadExcel } from '#/utils/file/download';

import toolDrawer from './tool-drawer.vue';
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
        return await mcpToolList({
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
  id: 'mcp-tool-index',
  showOverflow: false,
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [ToolDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: toolDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: McpTool) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: McpTool) {
  await mcpToolRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: McpTool) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await mcpToolRemove(ids);
      await tableApi.query();
    },
  });
}

async function handleTest(row: McpTool) {
  try {
    const result = await mcpToolTest(row.id);
    if (result.success) {
      message.success('工具连接测试成功');
    } else {
      message.error(`工具连接测试失败: ${result.message}`);
    }
  } catch (error) {
    message.error('工具连接测试失败');
  }
}

function handleDownloadExcel() {
  commonDownloadExcel(mcpToolExport, 'MCP工具数据', tableApi.formApi.form.values);
}

const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="MCP工具列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['mcp:tool:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['mcp:tool:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['mcp:tool:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <TableSwitch
          v-model:value="row.status"
          :api="() => mcpToolChangeStatus(row)"
          :disabled="!hasAccessByCodes(['mcp:tool:edit'])"
          :checked-value="'ENABLED'"
          :unchecked-value="'DISABLED'"
          @reload="tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['mcp:tool:query']"
            @click.stop="handleTest(row)"
          >
            测试
          </ghost-button>
          <ghost-button
            v-access:code="['mcp:tool:edit']"
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
              v-access:code="['mcp:tool:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ToolDrawer @reload="tableApi.query()" />
  </Page>
</template>
