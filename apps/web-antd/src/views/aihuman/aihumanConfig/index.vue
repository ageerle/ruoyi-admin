<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AihumanConfigInfo } from '#/api/aihuman/aihumanConfig/types';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';


import {
  Dropdown,
  Menu,
  MenuItem,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  aihumanConfigExport,
  aihumanConfigList,
  aihumanConfigRemove,
} from '#/api/aihuman/aihumanConfig';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import aihumanConfigModal from './aihumanConfig-modal.vue';

defineOptions({
  name: 'AihumanAihumanConfig',
});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  schema: querySchema(),
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
        return await aihumanConfigList({
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
  id: 'aihuman-aihumanConfig-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [AihumanConfigModal, modalApi] = useVbenModal({
  connectedComponent: aihumanConfigModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

function handleEdit(row: AihumanConfigInfo) {
  modalApi.setData({ id: row.id });
  modalApi.open();
}

async function handleDelete(row: AihumanConfigInfo) {
  await aihumanConfigRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: AihumanConfigInfo) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await aihumanConfigRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  const formValues = tableApi.formApi.form.values;
  commonDownloadExcel(aihumanConfigExport, '交互数字人配置数据', formValues, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <BasicTable class="overflow-hidden flex-1" table-title="交互数字人配置列表">
        <template #toolbar-tools>
          <Space>
            <a-button
              v-access:code="['aihuman:aihumanConfig:export']"
              @click="handleDownloadExcel"
            >
              {{ $t('pages.common.export') }}
            </a-button>
            <a-button
              :disabled="!vxeCheckboxChecked(tableApi)"
              danger
              type="primary"
              v-access:code="['aihuman:aihumanConfig:remove']"
              @click="handleMultiDelete"
            >
              {{ $t('pages.common.delete') }}
            </a-button>
            <a-button
              type="primary"
              v-access:code="['aihuman:aihumanConfig:add']"
              @click="handleAdd"
            >
              {{ $t('pages.common.add') }}
            </a-button>
          </Space>
        </template>
        <template #action="{ row }">
          <Space>
            <ghost-button
              v-access:code="['aihuman:aihumanConfig:edit']"
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
                v-access:code="['aihuman:aihumanConfig:remove']"
                @click.stop=""
              >
                {{ $t('pages.common.delete') }}
              </ghost-button>
            </Popconfirm>
          </Space>
        </template>
      </BasicTable>
    </div>
    <AihumanConfigModal @reload="tableApi.query()" />
  </Page>
</template>
