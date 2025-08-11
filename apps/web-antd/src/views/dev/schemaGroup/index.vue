<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="模型分组列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['dev:schemaGroup:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['dev:schemaGroup:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['dev:schemaGroup:edit']"
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
              v-access:code="['dev:schemaGroup:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <SchemaGroupModal @reload="tableApi.query()"/>
  </Page>
</template>

<script setup lang="ts">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid, vxeCheckboxChecked} from '#/adapter/vxe-table';
import type {SchemaGroupForm} from '#/api/dev/schemaGroup/schemaGroup';
import {devSchemaGroupDel, devSchemaGroupPage,} from '#/api/dev/schemaGroup/schemaGroup';
import {$t} from '@vben/locales';
import {getVxePopupContainer} from '@vben/utils';

import {Modal, Popconfirm, Space} from 'ant-design-vue';

import {columns, querySchema} from './data';
import schemaGroupModal from './schemaGroup-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 110,
    componentProps: {
      allowClear: true,
    },
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
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, formValues = {}) => {
        return await devSchemaGroupPage({
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
  // 表格全局唯一表示 保存列配置需要用到
  id: 'dev-schema-group-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [SchemaGroupModal, modalApi] = useVbenModal({
  connectedComponent: schemaGroupModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(row: Required<SchemaGroupForm>) {
  modalApi.setData({id: row.id});
  modalApi.open();
}

async function handleDelete(row: Required<SchemaGroupForm>) {
  await devSchemaGroupDel({ids: [row.id]});
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Required<SchemaGroupForm>) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await devSchemaGroupDel({ids});
      await tableApi.query();
    },
  });
}
</script>
