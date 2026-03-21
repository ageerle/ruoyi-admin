<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { OnlineUser } from '#/api/monitor/online/model';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Popconfirm } from 'ant-design-vue';
import { slice } from 'lodash-es';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { forceLogout, onlineList } from '#/api/monitor/online';

import { columns, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const onlineCount = ref(0);
const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      // 后端其实是一个假分页 返回的是全部数据
      query: async ({ page }, formValues = {}) => {
        const resp = await onlineList({
          ...formValues,
        });
        // 设置在线数
        onlineCount.value = resp.total;

        const { currentPage, pageSize } = page;
        // 当前需要截取的index -> 当前page-1 * 每页条数
        const currentIndex = (currentPage - 1) * pageSize;
        // 当前需要截取的endIndex -> currentIndex + 每页条数
        const endIndex = currentIndex + pageSize;
        // 截取区间内的数据
        const sliceRows = slice(resp.rows, currentIndex, endIndex);
        resp.rows = sliceRows;

        return resp;
      },
    },
  },
  scrollY: {
    enabled: true,
    gt: 0,
  },
  rowConfig: {
    keyField: 'tokenId',
  },
  id: 'monitor-online-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({ formOptions, gridOptions });

async function handleForceOffline(row: OnlineUser) {
  await forceLogout(row.tokenId);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable>
      <template #toolbar-actions>
        <div class="mr-1 pl-1 text-[1rem]">
          <div>
            在线用户列表 (共
            <span class="text-primary font-bold">{{ onlineCount }}</span>
            人在线)
          </div>
        </div>
      </template>
      <template #action="{ row }">
        <Popconfirm
          :get-popup-container="getVxePopupContainer"
          :title="`确认强制下线[${row.userName}]?`"
          placement="left"
          @confirm="handleForceOffline(row)"
        >
          <ghost-button danger>强制下线</ghost-button>
        </Popconfirm>
      </template>
    </BasicTable>
  </Page>
</template>
