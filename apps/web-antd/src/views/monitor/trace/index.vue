<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PageQuery } from '#/api/common';
import type { TraceRun } from '#/api/monitor/trace/model';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { addSortParams, useVbenVxeGrid } from '#/adapter/vxe-table';
import { traceRunList } from '#/api/monitor/trace';

import { columns, querySchema } from './data';
import traceDetailDrawer from './trace-detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    componentProps: {
      allowClear: true,
    },
    labelWidth: 80,
  },
  fieldMappingTime: [
    [
      'startTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
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
      query: async ({ page, sorts }, formValues = {}) => {
        const params: PageQuery = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        // 添加排序参数
        addSortParams(params, sorts);
        return await traceRunList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'traceId',
  },
  sortConfig: {
    multiple: true,
    remote: true,
  },
  id: 'monitor-trace-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridEvents: {
    sortChange: () => tableApi.query(),
  },
  gridOptions,
});

const [TraceDetailDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: traceDetailDrawer,
});

function handleDetail(record: TraceRun) {
  drawerApi.setData({ traceId: record.traceId });
  drawerApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable v-access:code="['monitor:trace:list']" table-title="Trace监控列表">
      <template #action="{ row }">
        <ghost-button
          v-access:code="['monitor:trace:query']"
          @click.stop="handleDetail(row)"
        >
          详情
        </ghost-button>
      </template>
    </BasicTable>
    <TraceDetailDrawer />
  </Page>
</template>
