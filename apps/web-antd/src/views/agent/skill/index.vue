<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ID } from '#/api/common';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { agentSkillList, agentSkillRemove } from '#/api/agent/skill';

import { columns, querySchema } from './data';
import SkillDrawer from './skill-drawer.vue';

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  id: 'agent-skill-index',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: ({ page }, values = {}) =>
        agentSkillList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...values,
        }),
    },
  },
  rowConfig: { keyField: 'id' },
  showOverflow: 'tooltip',
};

const [SkillTable, tableApi] = useVbenVxeGrid({
  formOptions: {
    commonConfig: { componentProps: { allowClear: true }, labelWidth: 80 },
    schema: querySchema(),
    wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  gridOptions,
});

const [EditDrawer, drawerApi] = useVbenDrawer({ connectedComponent: SkillDrawer });

function openSkill(id?: ID) {
  drawerApi.setData({ id });
  drawerApi.open();
}

async function deleteSkill(id: ID) {
  await agentSkillRemove(id);
  await tableApi.query();
}
</script>

<template>
  <Page :auto-content-height="true">
    <SkillTable table-title="技能列表">
      <template #toolbar-tools>
        <a-button v-access:code="['agent:skill:add']" type="primary" @click="openSkill()">
          新增
        </a-button>
      </template>
      <template #status="{ row }">
        <Tag :color="row.status === '0' ? 'green' : 'default'">
          {{ row.status === '0' ? '启用' : '停用' }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button v-access:code="['agent:skill:edit']" @click.stop="openSkill(row.id)">
            编辑
          </ghost-button>
          <Popconfirm title="确定删除这项技能？" @confirm="deleteSkill(row.id)">
            <ghost-button v-access:code="['agent:skill:remove']" danger @click.stop="">
              删除
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </SkillTable>
    <EditDrawer @reload="tableApi.query()" />
  </Page>
</template>
