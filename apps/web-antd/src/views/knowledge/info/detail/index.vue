<template>
  <Page title="知识库详情" class="bg-surface">
    <template #extra>
      <Button @click="handleBack">返回</Button>
    </template>
    
    <div class="p-4">
      <Tabs v-model:activeKey="activeKey" class="w-full bg-white px-4 pt-2 pb-4 rounded shadow-sm">
        <TabPane key="file" tab="文件管理" v-if="!isNew">
          <FileManagement :knowledge-id="knowledgeId" />
        </TabPane>
        <TabPane key="test" tab="检索测试" v-if="!isNew">
          <RetrievalTest :knowledge-id="knowledgeId" />
        </TabPane>
        <TabPane key="config" tab="知识库配置">
          <KnowledgeConfig :knowledge-id="isNew ? undefined : knowledgeId" @saved="handleConfigSaved" />
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Page } from '@vben/common-ui';
import { Tabs, TabPane, Button } from 'ant-design-vue';

import FileManagement from './components/FileManagement.vue';
import RetrievalTest from './components/RetrievalTest.vue';
import KnowledgeConfig from './components/KnowledgeConfig.vue';

const route = useRoute();
const router = useRouter();

const knowledgeIdStr = route.params.id as string;
const isNew = knowledgeIdStr === 'new';
const knowledgeId = isNew ? undefined : knowledgeIdStr;

const activeKey = ref(isNew ? 'config' : 'file');

function handleBack() {
  router.back();
}

function handleConfigSaved(newId: string | number) {
  if (isNew) {
    router.replace(`/knowledge/info/detail/${newId}`);
  }
}
</script>
