<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { OperationLog } from '#/api/monitor/operlog/model';

import { ref } from 'vue';

import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Modal, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  operLogClean,
  operLogDelete,
  operLogExport,
  operLogList,
} from '#/api/monitor/operlog';
import { downloadExcel } from '#/utils/file/download';
import { confirmDeleteModal } from '#/utils/modal';

import { columns, querySchema } from './data';
import operationPreviewDrawer from './OperationPreviewDrawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps<OperationLog> = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        // 区间选择器处理
        if (formValues?.createTime) {
          formValues.params = {
            beginTime: dayjs(formValues.createTime[0]).format(
              'YYYY-MM-DD 00:00:00',
            ),
            endTime: dayjs(formValues.createTime[1]).format(
              'YYYY-MM-DD 23:59:59',
            ),
          };
          Reflect.deleteProperty(formValues, 'createTime');
        } else {
          Reflect.deleteProperty(formValues, 'params');
        }
        return await operLogList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'operId',
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

const [OperationPreviewDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: operationPreviewDrawer,
});

/**
 * 预览
 * @param record 操作日志记录
 */
function handlePreview(record: Recordable<any>) {
  drawerApi.setData({ record });
  drawerApi.open();
}

/**
 * 清空全部日志
 */
function handleClear() {
  confirmDeleteModal({
    onValidated: async () => {
      await operLogClean();
    },
  });
}
/**
 * 删除日志
 */
async function handleDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.operId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条操作日志吗？`,
    onOk: async () => {
      await operLogDelete(ids);
      await tableApi.query();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">操作日志列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['monitor:operlog:remove']"
            @click="handleClear"
          >
            {{ $t('pages.common.clear') }}
          </a-button>
          <a-button
            v-access:code="['monitor:operlog:export']"
            @click="downloadExcel(operLogExport, '操作日志', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['monitor:operlog:remove']"
            @click="handleDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['monitor:operlog:list']"
          @click.stop="handlePreview(row)"
        >
          {{ $t('pages.common.preview') }}
        </a-button>
      </template>
    </BasicTable>
    <OperationPreviewDrawer />
  </Page>
</template>
