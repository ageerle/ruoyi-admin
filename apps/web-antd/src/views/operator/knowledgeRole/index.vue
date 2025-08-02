<script setup lang="ts">
import { onUnmounted } from 'vue';

import { Page } from '@vben/common-ui';

import KnowLedgeRole from './knowledgeRole/index.vue';
import { emitter } from './mitt';
import KnowLedgeRoleGroup from './knowledgeRoleGroup/index.vue';

onUnmounted(() => emitter.off('rowClick'));
</script>

<template>
  <Page :auto-content-height="true" content-class="flex flex-col lg:flex-row gap-4">
    <KnowLedgeRoleGroup class="flex-[2] overflow-hidden" />
    <KnowLedgeRole class="flex-[3] overflow-hidden" />
  </Page>
</template>
