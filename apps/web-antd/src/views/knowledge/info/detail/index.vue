<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAccess } from '@vben/access';
import { Page } from '@vben/common-ui';

import { Button, TabPane, Tabs } from 'ant-design-vue';

import AttachmentFragments from './components/AttachmentFragments.vue';
import FileManagement from './components/FileManagement.vue';
import KnowledgeConfig from './components/KnowledgeConfig.vue';
import RetrievalTest from './components/RetrievalTest.vue';
import { asKnowledgeId, knowledgeListPath } from './resources';

const route = useRoute();
const router = useRouter();
const { hasAccessByCodes } = useAccess();

const knowledgeId = computed(() => asKnowledgeId(route.params.id));
const isNew = computed(() => route.params.id === 'new');
const canViewAttachments = computed(() =>
  hasAccessByCodes(['system:attach:list']),
);
const canViewAttachmentFragments = computed(
  () =>
    hasAccessByCodes(['system:attach:query']) &&
    hasAccessByCodes(['system:fragment:list']),
);
const activeKey = computed(() => {
  if (isNew.value) return 'config';
  const { tab } = route.query;
  if (tab === 'config' || tab === 'test') return tab;
  if ((tab === 'attach' || tab === 'fragment') && canViewAttachments.value) {
    return 'attach';
  }
  return 'config';
});
const attachmentId = computed(() => asKnowledgeId(route.query.attachmentId));
const viewingFragments = computed(
  () =>
    activeKey.value === 'attach' &&
    canViewAttachmentFragments.value &&
    route.query.attachmentId !== undefined,
);
const refreshTrigger = shallowRef(0);
const testRefreshTrigger = shallowRef(0);

watch(
  () => route.params.id,
  () => {
    refreshTrigger.value = 0;
    testRefreshTrigger.value = 0;
    if (!knowledgeId.value && !isNew.value) {
      void router.replace(knowledgeListPath);
    }
  },
  { immediate: true },
);

watch(
  () => [route.name, route.query.tab] as const,
  ([name, tab]) => {
    if (name === 'KnowledgeInfoDetail' && tab === 'fragment') {
      void router.replace({ query: { ...route.query, tab: 'attach' } });
    }
  },
  { immediate: true },
);

function selectTab(tab: number | string) {
  const query = { ...route.query };
  delete query.attachmentId;
  void router.push({ query: { ...query, tab: String(tab) } });
}

function openAttachment(id: number | string) {
  void router.push({
    query: { ...route.query, attachmentId: String(id), tab: 'attach' },
  });
}

function closeAttachment() {
  const query = { ...route.query };
  delete query.attachmentId;
  void router.push({ query: { ...query, tab: 'attach' } });
}

function handleConfigUpdated() {
  refreshTrigger.value += 1;
}

function handleBack() {
  void router.push(knowledgeListPath);
}

function handleConfigSaved(newId: number | string) {
  if (isNew.value) {
    void router.replace({
      name: 'KnowledgeInfoDetail',
      params: { id: String(newId) },
    });
  } else {
    testRefreshTrigger.value += 1;
  }
}
</script>

<template>
  <Page title="知识库详情" class="bg-surface">
    <template #extra>
      <Button @click="handleBack">返回知识库</Button>
    </template>

    <div class="p-4">
      <Tabs
        v-if="knowledgeId || isNew"
        :active-key="activeKey"
        class="w-full rounded bg-white px-4 pb-4 pt-2 shadow-sm"
        @change="selectTab"
      >
        <TabPane key="config" tab="知识库配置">
          <KnowledgeConfig
            :key="knowledgeId ?? 'new'"
            :knowledge-id="knowledgeId"
            :refresh-trigger="refreshTrigger"
            @saved="handleConfigSaved"
          />
        </TabPane>
        <TabPane v-if="knowledgeId" key="test" tab="检索测试">
          <RetrievalTest
            :key="knowledgeId"
            :knowledge-id="knowledgeId"
            :refresh-trigger="testRefreshTrigger"
            @config-updated="handleConfigUpdated"
          />
        </TabPane>
        <TabPane
          v-if="knowledgeId && canViewAttachments"
          key="attach"
          tab="知识附件"
        >
          <FileManagement
            v-show="!viewingFragments"
            :key="knowledgeId"
            :knowledge-id="knowledgeId"
            @view-fragments="openAttachment"
          />
          <AttachmentFragments
            v-if="viewingFragments"
            :attachment-id="attachmentId"
            :knowledge-id="knowledgeId"
            @back="closeAttachment"
          />
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>
