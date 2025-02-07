<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { listToTree } from '@vben/utils';

import { Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { menuList, menuRemove } from '#/api/system/menu';

import { columns, querySchema } from './data';
import menuDrawer from './menu-drawer.vue';

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
        const resp = await menuList({
          ...formValues,
        });
        const treeData = listToTree(resp, {
          id: 'menuId',
          pid: 'parentId',
          children: 'children',
        });
        return { rows: treeData };
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'menuId',
  },
  round: true,
  align: 'center',
  showOverflow: true,
  treeConfig: {
    parentField: 'parentId',
    rowField: 'menuId',
    transform: false,
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });
const [MenuDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: menuDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.menuId });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await menuRemove(row.menuId);
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
        <span class="pl-[7px] text-[16px]">菜单权限列表</span>
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
            v-access:code="['system:menu:add']"
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
            v-access:code="['system:menu:edit']"
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
              v-access:code="['system:menu:delete']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <MenuDrawer @reload="tableApi.query()" />
  </Page>
</template>
