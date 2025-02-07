<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  tenantExport,
  tenantList,
  tenantRemove,
  tenantStatusChange,
} from '#/api/system/tenant';
import { TableSwitch } from '#/components/table';
import { downloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import tenantDrawer from './tenant-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
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
    // 点击行选中
    // trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
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

        return await tenantList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'id',
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

const [TenantDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: tenantDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.id });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await tenantRemove(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await tenantRemove(ids);
      await tableApi.query();
      checked.value = false;
    },
  });
}
const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Page :auto-content-height="true">
    todo 新增修改删除与store同步 修改不显示密码
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">租户列表 </span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:tenant:export']"
            @click="downloadExcel(tenantExport, '租户数据', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:tenant:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:tenant:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <TableSwitch
          v-model="row.status"
          :api="() => tenantStatusChange(row)"
          :disabled="row.id === 1 || !hasAccessByCodes(['system:tenant:edit'])"
          :reload="() => tableApi.query()"
        />
      </template>
      <template #action="{ row }">
        <a-button
          size="small"
          type="link"
          v-access:code="['system:tenant:edit']"
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
            v-access:code="['system:tenant:remove']"
            @click.stop=""
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Popconfirm>
      </template>
    </BasicTable>
    <TenantDrawer @reload="tableApi.query()" />
  </Page>
</template>
