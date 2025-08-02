<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { PageQuery } from '#/api/common';
import type { KnowledgeRole } from '#/api/operator/knowledgeRole/knowledge-role-model';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';

import { emitter } from '../mitt';
import { columns, querySchema } from './data';
import knowledgeRoleDrawer from './knowledge-role-drawer.vue';
import { knowledgeRoleList, knowledgeRoleRemove } from '#/api/operator/knowledgeRole/knowledge-role';
import { optionOptions } from 'ant-design-vue/es/vc-mentions/src/Option';

const groupId = ref('');

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
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
        const params: PageQuery = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        };
        if (groupId.value) {
          params.groupId = groupId.value;
        }

        return await knowledgeRoleList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'knowledge-role-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [KnowledgeRoleDrawer, drawerApi] = useVbenDrawer({
  connectedComponent: knowledgeRoleDrawer
});

function handleAdd() {
  drawerApi.setData({ groupId: groupId.value });
  drawerApi.open();
}

async function handleEdit(record: KnowledgeRole) {
  drawerApi.setData(record);
  drawerApi.open();
}

async function handleDelete(row: KnowledgeRole) {
  await knowledgeRoleRemove([row.id]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: KnowledgeRole) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await knowledgeRoleRemove(ids);
      await tableApi.query();
    },
  });
}

emitter.on('rowClick', async (value) => {
  groupId.value = value;

  await tableApi.query();
});
</script>

<template>
  <div>
    <BasicTable id="knowledge-role" table-title="知识库角色列表">
      <template #toolbar-tools>
        <Space>
          <a-button :disabled="!vxeCheckboxChecked(tableApi)" danger type="primary" @click="handleMultiDelete">
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button :disabled="groupId === ''" type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button @click="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm :get-popup-container="(node) => getVxePopupContainer(node, 'knowledge-role')
            " placement="left" title="确认删除？" @confirm="handleDelete(row)">
            <ghost-button danger @click.stop="">
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <KnowledgeRoleDrawer @reload="tableApi.query()" />
  </div>
</template>
