<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import { useAppConfig, useTabs } from '@vben/hooks';
import { stringify } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { useEventListener } from '@vueuse/core';

defineOptions({ name: 'FlowDesigner' });

const route = useRoute();
const definitionId = route.query.definitionId as string;
// const disabled = route.query.disabled === 'true';

const { clientId } = useAppConfig(import.meta.env, import.meta.env.PROD);

const accessStore = useAccessStore();
const params = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  id: definitionId,
  clientid: clientId,
  onlyDesignShow: true,
};

/**
 * iframe设计器的地址
 */
const url = `${import.meta.env.VITE_GLOB_API_URL}/warm-flow-ui/index.html?${stringify(params)}`;

const { closeCurrentTab } = useTabs();
const router = useRouter();

function messageHandler(event: MessageEvent) {
  switch (event.data.method) {
    case 'close': {
      // 关闭当前tab
      closeCurrentTab();
      // 跳转到流程定义列表
      router.push('/workflow/processDefinition');
      break;
    }
  }
}

// iframe监听组件内设计器保存事件
useEventListener('message', messageHandler);
</script>

<template>
  <div class="size-full">
    <iframe :src="url" class="size-full"></iframe>
  </div>
</template>
