<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Popconfirm } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogout2, onlineDeviceList } from '#/api/monitor/online';
import { columns } from '#/views/monitor/online/data';

const onlineDeviceColumns: VxeGridProps['columns'] = [
  {
    type: 'seq',
    title: '序号',
    width: 60,
  },
  // 个人中心不需要显示重复字段
  ...(columns?.filter(
    (item) => !['deptName', 'userName'].includes(item.field ?? ''),
  ) ?? []),
];

const gridOptions: VxeGridProps = {
  columns: onlineDeviceColumns,
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  maxHeight: 600,
  proxyConfig: {
    ajax: {
      query: async () => {
        return await onlineDeviceList();
      },
    },
  },
  rowConfig: {
    keyField: 'tokenId',
    isCurrent: true,
  },
};

const [BasicTable, tableApi] = useVbenVxeGrid({ gridOptions });

async function handleForceOffline(row: Recordable<any>) {
  await forceLogout2(row.tokenId);
  await tableApi.query();
}
</script>

<template>
  <div>
    <BasicTable table-title="我的在线设备">
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
