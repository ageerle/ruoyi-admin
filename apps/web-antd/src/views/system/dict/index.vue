<script setup lang="ts">
import { Page } from '@vben/common-ui';

import DictDataPanel from './data/index.vue';
import DictTypePanel from './type/index.vue';
</script>

<template>
  <Page :auto-content-height="true" content-class="flex flex-col lg:flex-row">
    <DictTypePanel class="flex-1 overflow-hidden" />
    <DictDataPanel class="flex-1 overflow-hidden" />
  </Page>
</template>

<style scoped>
/**
TODO: ugly code
*/
:deep(.p-4) {
  padding: 6px;
}
</style>
