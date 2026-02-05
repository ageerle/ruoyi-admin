<!-- 流程图预览组件 -->

<script setup lang="ts">
import { useAppConfig } from '@vben/hooks';
import { stringify } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { useWarmflowIframe } from './hook';

defineOptions({ name: 'FlowPreview' });

const props = defineProps<Props>();

interface Props {
  /**
   * 流程实例ID
   */
  instanceId: string;
}

const { clientId } = useAppConfig(import.meta.env, import.meta.env.PROD);

const accessStore = useAccessStore();
const params = {
  Authorization: `Bearer ${accessStore.accessToken}`,
  id: props.instanceId,
  clientid: clientId,
  type: 'FlowChart',
};

/**
 * iframe地址
 * 后端地址 + 固定flow地址拼接
 */
const url = `${import.meta.env.VITE_GLOB_API_URL}/warm-flow-ui/index.html?${stringify(params)}`;

const { iframeRef } = useWarmflowIframe();
</script>

<template>
  <iframe
    ref="iframeRef"
    :src="url"
    class="h-[600px] w-full rounded-[6px] border"
  ></iframe>
</template>
