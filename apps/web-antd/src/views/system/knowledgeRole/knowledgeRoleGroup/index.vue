<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { KnowledgeRoleGroup } from '#/api/system/knowledgeRole/knowledge-role-group-model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';

import { emitter } from '../mitt';
import { columns, querySchema } from './data';
import knowledgeRoleGroupModal from './knowledge-role-group-modal.vue';
import { knowledgeRoleGroupList, knowledgeRoleGroupRemove } from '#/api/system/knowledgeRole/knowledge-role-group';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 70,
    componentProps: {
      allowClear: true,
    },
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
        return await knowledgeRoleGroupList({
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
  id: 'knowledge-role-group-index',
};

const lastGroupId = ref('');

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    cellClick: (e) => {
      const { row } = e;
      if (lastGroupId.value === row.id) {
        return;
      }
      emitter.emit('rowClick', row.id);
      lastGroupId.value = row.id;
    },
  },
});
const [KnowledgeRoleGroupModal, modalApi] = useVbenModal({
  connectedComponent: knowledgeRoleGroupModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: KnowledgeRoleGroup) {
  modalApi.setData({ id: record.id });
  modalApi.open();
}

async function handleDelete(row: KnowledgeRoleGroup) {
  await knowledgeRoleGroupRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: KnowledgeRoleGroup) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await knowledgeRoleGroupRemove(ids);
      await tableApi.query();
    },
  });
}
</script>

<template>
  <div>
    <BasicTable id="knowledge-role-group" table-title="知识库角色组">
      <template #toolbar-tools>
        <Space>
          <a-button :disabled="!vxeCheckboxChecked(tableApi)" danger type="primary" @click="handleMultiDelete">
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button @click.stop=" handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm :get-popup-container="(node) => getVxePopupContainer(node, 'knowledge-role-group')
            " placement="left" title="确认删除？" @confirm="handleDelete(row)">
            <ghost-button danger v-access:code="['system:dict:remove']" @click.stop="">
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <KnowledgeRoleGroupModal @reload="tableApi.query()" />
  </div>
</template>
