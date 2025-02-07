<script setup lang="ts">
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';

import { Card } from 'ant-design-vue';

import { useVbenForm } from '#/adapter';

import { querySchema } from './data';

const route = useRoute();
const roleId = route.params.roleId as string;

const [QueryForm] = useVbenForm({
  // 默认展开
  collapsed: false,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  schema: querySchema(),
  // 是否可展开
  showCollapseButton: true,
  submitButtonOptions: {
    text: '查询',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
});
</script>

<template>
  <Page>
    <Card class="flex-1">
      <QueryForm />
      ID: {{ roleId }}
    </Card>
  </Page>
</template>
