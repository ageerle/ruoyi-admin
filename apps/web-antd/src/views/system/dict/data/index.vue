<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  dictDataExport,
  dictDataList,
  dictDataRemove,
} from '#/api/system/dict/dict-data';
import { downloadExcel } from '#/utils/file/download';

import { emitter } from '../mitt';
import { columns, querySchema } from './data';
import dictDataDrawer from './dict-data-drawer.vue';

const dictType = ref('');

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
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

        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        if (dictType.value) {
          params.dictType = dictType.value;
        }

        return await dictDataList(params);
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'dictCode',
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

const [DictDataDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: dictDataDrawer,
});

function handleAdd() {
  drawerApi.setData({ dictType: dictType.value });
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({
    dictType: dictType.value,
    dictCode: record.dictCode,
  });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await dictDataRemove(row.dictCode);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.dictCode);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await dictDataRemove(ids);
      await tableApi.query();
    },
  });
}

emitter.on('rowClick', async (value) => {
  dictType.value = value;
  await tableApi.query();
});
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">字典数据列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:dict:export']"
            @click="downloadExcel(dictDataExport, '字典数据', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:dict:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            :disabled="dictType === ''"
            type="primary"
            v-access:code="['system:dict:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['system:dict:edit']"
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
            v-access:code="['system:dict:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
    <DictDataDrawer @reload="tableApi.query()" />
  </Page>
</template>
