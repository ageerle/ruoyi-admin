<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  clientChangeStatus,
  clientExport,
  clientList,
  clientRemove,
} from '#/api/system/client';
import { TableSwitch } from '#/components/table';
import { downloadExcel } from '#/utils/file/download';

import clientDrawer from './client-drawer.vue';
import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
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
    checkMethod: (row: any) => row?.id !== 1,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await clientList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'id',
    height: 90,
  },
  round: true,
  align: 'center',
  showOverflow: true,
};

const checked = ref(false);
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    checkboxChange: (e: any) => {
      checked.value = e.records.length > 0;
    },
    checkboxAll: (e: any) => {
      checked.value = e.records.length > 0;
    },
  },
});

const [ClientDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: clientDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await clientRemove(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await clientRemove(ids);
      await tableApi.query();
    },
  });
}

const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">系统授权列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:client:export']"
            @click="downloadExcel(clientExport, '系统授权数据', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:client:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:client:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <!-- pc不允许禁用 禁用了直接登录不了 应该设置disabled -->
        <!-- 登录提示: 认证权限类型已禁用 -->
        <TableSwitch
          v-model="row.status"
          :api="() => clientChangeStatus(row)"
          :disabled="row.id === 1 || !hasAccessByCodes(['system:client:edit'])"
          :reload="() => tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['system:client:edit']"
          @click="handleEdit(row)"
        >
          {{ $t('pages.common.edit') }}
        </a-button>
        <Popconfirm
          :disabled="row.id === 1"
          placement="left"
          title="确认删除？"
          @confirm="handleDelete(row)"
        >
          <a-button
            :disabled="row.id === 1"
            danger
            size="small"
            type="link"
            v-access:code="['system:client:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
    <ClientDrawer @reload="tableApi.query()" />
  </Page>
</template>
