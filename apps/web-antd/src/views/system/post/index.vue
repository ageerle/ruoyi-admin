<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenDrawer, type VbenFormProps } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import { postExport, postList, postRemove } from '#/api/system/post';
import { downloadExcel } from '#/utils/file/download';
import DeptTree from '#/views/system/user/dept-tree.vue';

import { columns, querySchema } from './data';
import postDrawer from './post-drawer.vue';

// 左边部门用
const selectDeptId = ref<string[]>([]);
const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  handleReset: async () => {
    selectDeptId.value = [];
    // eslint-disable-next-line no-use-before-define
    await tableApi.query();
  },
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    trigger: 'cell',
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

        // 部门树选择处理
        if (selectDeptId.value.length === 1) {
          formValues.deptId = selectDeptId.value[0];
        } else {
          Reflect.deleteProperty(formValues, 'deptId');
        }

        return await postList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'postId',
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

const [PostDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: postDrawer,
});

function handleAdd() {
  drawerApi.setData({});
  drawerApi.open();
}

async function handleEdit(record: Recordable<any>) {
  drawerApi.setData({ id: record.postId });
  drawerApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await postRemove(row.postId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.postId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await postRemove(ids);
      await tableApi.reload();
    },
  });
}
</script>

<template>
  <Page :auto-content-height="true" content-class="flex gap-[8px]">
    <DeptTree
      v-model:select-dept-id="selectDeptId"
      :height="300"
      class="w-[260px]"
      @select="() => tableApi.query()"
    />
    <BasicTable class="flex-1 overflow-hidden">
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">岗位列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button
            v-access:code="['system:post:export']"
            @click="downloadExcel(postExport, '岗位信息数据', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['system:post:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['system:post:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <a-button
            size="small"
            type="link"
            v-access:code="['system:post:edit']"
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
              v-access:code="['system:post:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <PostDrawer @reload="tableApi.query()" />
  </Page>
</template>
