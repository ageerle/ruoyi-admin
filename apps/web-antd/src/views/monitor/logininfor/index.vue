<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter';
import {
  loginInfoClean,
  loginInfoExport,
  loginInfoList,
  loginInfoRemove,
  userUnlock,
} from '#/api/monitor/logininfo';
import { downloadExcel } from '#/utils/file/download';
import { confirmDeleteModal } from '#/utils/modal';

import { columns, querySchema } from './data';
import loginInfoModal from './login-info-modal.vue';

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
    trigger: 'row',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await loginInfoList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    isHover: true,
    keyField: 'infoId',
  },
  round: true,
  align: 'center',
  showOverflow: true,
};

const checked = ref(false);
const canUnlock = ref(false);
const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    checkboxChange: (e: any) => {
      checked.value = e.records.length > 0;
      canUnlock.value = e.records.length === 1 && e.records[0]?.status === '1';
    },
    checkboxAll: (e: any) => {
      checked.value = e.records.length > 0;
    },
  },
});

const [LoginInfoModal, modalApi] = useVbenModal({
  connectedComponent: loginInfoModal,
});

function handlePreview(record: Recordable<any>) {
  modalApi.setData(record);
  modalApi.open();
}

function handleClear() {
  confirmDeleteModal({
    onValidated: async () => {
      await loginInfoClean();
    },
  });
}

async function handleDelete(row: Recordable<any>) {
  await loginInfoRemove(row.infoId);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.infoId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await loginInfoRemove(ids);
      await tableApi.query();
      checked.value = false;
    },
  });
}

async function handleUnlock() {
  const records = tableApi.grid.getCheckboxRecords();
  if (records.length !== 1) {
    return;
  }
  const { userName } = records[0];
  await userUnlock(userName);
  await tableApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <BasicTable>
      <template #toolbar-actions>
        <span class="pl-[7px] text-[16px]">登录日志列表</span>
      </template>
      <template #toolbar-tools>
        <Space>
          <a-button @click="handleClear">
            {{ $t('pages.common.clear') }}
          </a-button>
          <a-button
            v-access:code="['monitor:logininfor:export']"
            @click="downloadExcel(loginInfoExport, '登录日志', {})"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!checked"
            danger
            type="primary"
            v-access:code="['monitor:logininfor:delete']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button :disabled="!canUnlock" type="primary" @click="handleUnlock">
            解锁
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <a-button size="small" type="link" @click.stop="handlePreview(row)">
            {{ $t('pages.common.info') }}
          </a-button>
          <Popconfirm
            placement="left"
            title="确认删除?"
            @confirm="() => handleDelete(row)"
          >
            <a-button danger size="small" type="link" @click.stop="">
              删除
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <LoginInfoModal />
  </Page>
</template>
