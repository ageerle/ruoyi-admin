<script setup lang="ts">
import { watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { asKnowledgeId, knowledgeListPath } from '../resources';

const props = defineProps<{ tab: 'attach' | 'fragment' }>();
const route = useRoute();
const router = useRouter();

watchEffect(() => {
  if (route.path.split('/').at(-1) !== props.tab) return;
  const id = asKnowledgeId(route.query.knowledgeId);
  if (id) {
    const attachmentId = asKnowledgeId(route.query.attachmentId);
    void router.replace({
      name: 'KnowledgeInfoDetail',
      params: { id },
      query: { attachmentId, tab: 'attach' },
    });
  } else {
    void router.replace(knowledgeListPath);
  }
});
</script>

<template>
  <Page>
    <RouterLink :to="knowledgeListPath">返回知识库</RouterLink>
  </Page>
</template>
