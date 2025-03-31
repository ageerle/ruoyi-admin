<script setup lang="ts">
import type { Ref } from 'vue';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { GenInfo } from '#/api/tool/gen/model';

import { inject } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { validRules, vxeTableColumns } from './gen-data';

/**
 * 从父组件注入
 */
const genInfoData = inject('genInfoData') as Ref<GenInfo['info']>;

const gridOptions: VxeGridProps = {
  columns: vxeTableColumns,
  keepSource: true,
  editConfig: { trigger: 'click', mode: 'cell', showStatus: true },
  editRules: validRules,
  rowConfig: {
    keyField: 'id',
    isCurrent: true, // 高亮当前行
  },
  columnConfig: {
    resizable: true,
  },
  proxyConfig: {
    enabled: true,
  },
  toolbarConfig: {
    enabled: false,
  },
  height: 'auto',
  pagerConfig: {
    enabled: false,
  },
  data: genInfoData.value.columns,
};

const [BasicTable, tableApi] = useVbenVxeGrid({ gridOptions });

/**
 * 校验表格数据
 */
async function validateTable() {
  const hasError = await tableApi.grid.validate();
  return !hasError;
}

/**
 * 获取表格数据
 */
function getTableRecords() {
  return tableApi?.grid?.getData?.() ?? [];
}

defineExpose({
  validateTable,
  getTableRecords,
});
</script>

<template>
  <div class="flex flex-col gap-[16px]">
    <div class="h-[calc(100vh-200px)] overflow-y-hidden">
      <BasicTable />
    </div>
  </div>
</template>
