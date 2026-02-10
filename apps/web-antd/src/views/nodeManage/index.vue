<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { columns } from './data';
import type { NodeInfo } from './index.d';
import { workflowApi } from '#/api/aiflow';
import { Modal, Popconfirm, Space, Button } from 'ant-design-vue';
import AddModal from './modal.vue';
// const formOptions: VbenFormProps = {
//   commonConfig: {
//     labelWidth: 80,
//     componentProps: {
//       allowClear: true,
//     },
//   },
//   //schema: querySchema(),
//   wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
// };

const [AddNodeModal, modalApi] = useVbenModal({
  connectedComponent: AddModal,
});
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
        const result = await workflowApi.workflowComponents({
          currentPage: page.currentPage,
          pageSize: page.pageSize,
          wfSearchReq: {
            ...formValues,
          },
        });
        // 转换数据结构以匹配 VXE 表格期望的格式
        return {
          rows: result,
          total: result.total ? result.total : 0,
        };
      },
    },
  },
  rowConfig: {
    keyField: 'uuid',
  },
  id: 'workflow-index',
};
const [BasicTable, tableApi] = useVbenVxeGrid({
  // formOptions,
  gridOptions,
});

// 新建工作流
function handleAdd() {
  console.log('modelApi', modalApi);
  modalApi.setData({});
  modalApi.open();
}

// 编辑工作流基本信息
function handleEditInfo(record: NodeInfo) {
  modalApi.setData({
    uuid: record.uuid,
    name: record.name,
    title: record.title,
    remark: record.remark,
    isEnable: record.isEnable,
  });
  modalApi.open();
}
</script>
<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="节点列表">
      <template #toolbar-tools>
        <Space>
          <Button type="primary" @click="handleAdd"> 新建节点 </Button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button @click.stop="handleEditInfo(row)"> 编辑 </ghost-button>
        </Space></template
      >
    </BasicTable>
    <AddNodeModal @reload="tableApi.query()" />
  </Page>
</template>
