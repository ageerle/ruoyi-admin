<script setup lang="ts">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid, vxeCheckboxChecked} from '#/adapter/vxe-table';
import type {SchemaInfo} from '#/api/dev/schema/types';
import {$t} from '@vben/locales';
import {getVxePopupContainer} from '@vben/utils';

import {Modal, Popconfirm, Space} from 'ant-design-vue';
import {schemaList, schemaRemove,} from '#/api/dev/schema/schema';

import {columns, querySchema} from './data';
import schemaModal from './schema-modal.vue';

defineOptions({
  name: 'DevSchema',
});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 处理区间选择器RangePicker时间格式 将一个字段映射为两个字段 搜索会用到
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginCreateTime]', 'params[endCreateTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
    [
      'updateTime',
      ['params[beginUpdateTime]', 'params[endUpdateTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
  },
  // 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
  // columns: columns(),
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({page}, formValues = {}) => {
        return await schemaList({
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
  id: 'dev-schema-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [SchemaModal, modalApi] = useVbenModal({
  connectedComponent: schemaModal,
});

const [FieldManageModal, fieldModalApi] = useVbenModal({
  connectedComponent: () => import('../schemaField/schema-field-modal.vue'),
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(row: Required<SchemaInfo>) {
  modalApi.setData({id: row.id});
  modalApi.open();
}

async function handleDelete(row: Required<SchemaInfo>) {
  await schemaRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: Required<SchemaInfo>) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await schemaRemove(ids);
      await tableApi.query();
    },
  });
}


</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="数据模型列表">
      <template #toolbar-tools>
        <Space>
          <a-button :disabled="!vxeCheckboxChecked(tableApi)" danger type="primary"
                    v-access:code="['dev:schema:remove']" @click="handleMultiDelete">
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button type="primary" v-access:code="['dev:schema:add']" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button v-access:code="['dev:schema:edit']" @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm :get-popup-container="getVxePopupContainer" placement="left" title="确认删除？"
                      @confirm="handleDelete(row)">
            <ghost-button danger v-access:code="['dev:schema:remove']" @click.stop="">
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <SchemaModal @reload="tableApi.query()"/>
    <FieldManageModal/>
  </Page>
</template>
