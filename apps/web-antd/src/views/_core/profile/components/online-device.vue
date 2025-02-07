<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { forceLogout2, onlineDeviceList } from '#/api/monitor/online';
import { columns } from '#/views/monitor/online/data';

const gridOptions: VxeGridProps = {
  columns,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        return await onlineDeviceList();
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

const [BasicTable, tableApi] = useVbenVxeGrid({ gridOptions });

async function handleForceOffline(row: Recordable<any>) {
  await forceLogout2(row.tokenId);
  await tableApi.query();
}
</script>

<template>
  <div>
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">我的在线设备</span>
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
  </div>
</template>
