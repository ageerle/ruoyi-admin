<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { Page, type VbenFormProps } from '@vben/common-ui';

import { Popconfirm } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { forceLogout, onlineList } from '#/api/monitor/online';

import { columns, querySchema } from './data';

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
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await onlineList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'tokenId',
  },
  round: true,
  align: 'center',
  showOverflow: true,
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

async function handleForceOffline(row: Recordable<any>) {
  await forceLogout(row.tokenId);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">在线用户列表</span>
      </template>
      <template #action="{ row }">
        <Popconfirm
          :title="`确认强制下线[${row.userName}]?`"
          placement="left"
          @confirm="handleForceOffline(row)"
        >
          <a-button danger size="small" type="link">强制下线</a-button>
        </Popconfirm>
      </template>
    </BasicTable>
  </Page>
</template>
