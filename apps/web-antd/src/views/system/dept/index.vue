<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { nextTick } from 'vue';

import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { listToTree } from '@vben/utils';

import { Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { deptList, deptRemove } from '#/api/system/dept';

import { columns, querySchema } from './data';
import deptDrawer from './dept-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async (_, formValues) => {
        const resp = await deptList({
          ...formValues,
        });
        const treeData = listToTree(resp, {
          id: 'deptId',
          pid: 'parentId',
          children: 'children',
        });
        return { rows: treeData };
      },
      // 默认请求接口后展开全部 不需要可以删除这段
      querySuccess: () => {
        nextTick(() => {
          expandAll();
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'deptId',
  },
  round: true,
  align: 'center',
  showOverflow: true,
  treeConfig: {
    parentField: 'parentId',
    rowField: 'deptId',
    transform: false,
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [DeptDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: deptDrawer,
});

function handleAdd() {
  drawerApi.setData({ update: false });
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.deptId, update: true });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await deptRemove(row.deptId);
  await tableApi.query();
}

function expandAll() {
  tableApi.grid?.setAllTreeExpand(true);
}

function collapseAll() {
  tableApi.grid?.setAllTreeExpand(false);
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">部门列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button @click="collapseAll">
            {{ $t('pages.common.collapse') }}
          </a-button>
          <a-button @click="expandAll">
            {{ $t('pages.common.expand') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:dept:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <a-button
            size="small"
            type="link"
            v-access:code="['system:dept:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </a-button>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <a-button
              danger
              size="small"
              type="link"
              v-access:code="['system:dept:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <DeptDrawer @reload="tableApi.query()" />
  </Page>
</template>
