<script setup lang="ts">
import { shallowRef, watch } from 'vue';

import { useAccess } from '@vben/access';

import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { Button, Space } from 'ant-design-vue';

import { attachInfo } from '#/api/knowledge/attach';
import { infoInfo } from '#/api/knowledge/info';
import FragmentTable from '#/views/knowledge/fragment/fragment-table.vue';

const props = defineProps<{
  attachmentId?: string;
  knowledgeId: string;
}>();
const emit = defineEmits<{ back: [] }>();
const { hasAccessByCodes } = useAccess();
const attachment = shallowRef<{ docId: string; name: string }>();
const libraryName = shallowRef('');
const loading = shallowRef(false);
const status = shallowRef('');
const retryable = shallowRef(false);
const refresh = shallowRef(0);
const attachmentLoadDeadlineMs = 12_000;

watch(
  () => props.knowledgeId,
  async (knowledgeId, _, onCleanup) => {
    libraryName.value = '';
    if (!hasAccessByCodes(['system:info:query'])) return;

    const controller = new AbortController();
    onCleanup(() => controller.abort());
    try {
      const library = await infoInfo(knowledgeId, {
        errorMessageMode: 'none',
        signal: controller.signal,
      });
      if (!controller.signal.aborted) libraryName.value = library?.name ?? '';
    } catch {
      // 只有页头使用知识库名称，无法获取时继续显示知识库 ID。
    }
  },
  { immediate: true },
);

watch(
  [() => props.knowledgeId, () => props.attachmentId, refresh],
  async ([knowledgeId, attachmentId], _, onCleanup) => {
    attachment.value = undefined;
    status.value = '';
    retryable.value = false;
    loading.value = false;
    if (!attachmentId) {
      status.value = '附件链接无效，请返回列表重新选择。';
      return;
    }

    const controller = new AbortController();
    loading.value = true;
    const deadline = setTimeout(() => {
      controller.abort();
      status.value = '附件加载超时，请重试。';
      retryable.value = true;
      loading.value = false;
    }, attachmentLoadDeadlineMs);
    onCleanup(() => {
      clearTimeout(deadline);
      controller.abort();
    });

    try {
      const record = await attachInfo(attachmentId, {
        errorMessageMode: 'none',
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (
        String(record?.id) !== attachmentId ||
        String(record?.knowledgeId) !== knowledgeId
      ) {
        status.value = '当前知识库中找不到该附件，请返回列表重新选择。';
        return;
      }
      if (!record.docId?.trim()) {
        status.value = '该附件还没有可查看的片段。';
        return;
      }
      attachment.value = { docId: record.docId, name: record.name };
    } catch {
      if (controller.signal.aborted) return;
      status.value = '附件加载失败。';
      retryable.value = true;
    } finally {
      clearTimeout(deadline);
      if (!controller.signal.aborted) loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <section aria-label="附件片段" class="attachment-fragments">
    <header class="fragment-heading">
      <div class="fragment-heading-main">
        <h2 class="fragment-title">知识片段</h2>
        <dl class="fragment-context">
          <div class="fragment-context-item">
            <dt>{{ libraryName ? '知识库' : '知识库 ID' }}</dt>
            <dd>{{ libraryName || knowledgeId }}</dd>
          </div>
          <div v-if="attachment" class="fragment-context-item">
            <dt>附件</dt>
            <dd>{{ attachment.name }}</dd>
          </div>
        </dl>
      </div>
      <Button @click="emit('back')">
        <template #icon><ArrowLeftOutlined /></template>
        返回附件列表
      </Button>
    </header>

    <p v-if="loading" role="status">正在加载附件…</p>
    <Space v-else-if="status" align="center" wrap>
      <span role="status">{{ status }}</span>
      <Button v-if="retryable" type="link" @click="refresh += 1">重试</Button>
    </Space>
    <FragmentTable
      v-else-if="attachment"
      :key="attachmentId"
      :attachment-name="attachment.name"
      :doc-id="attachment.docId"
      :knowledge-id="knowledgeId"
    />
  </section>
</template>

<style scoped>
.attachment-fragments {
  display: grid;
  min-width: 0;
  gap: 16px;
  padding: 8px 0 0;
}

.fragment-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px 24px;
}

.fragment-heading-main {
  flex: 1 1 240px;
  min-width: 0;
}

.fragment-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.fragment-context {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 0;
  font-size: 13px;
}

.fragment-context-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.fragment-context-item dt {
  flex: none;
  color: hsl(var(--muted-foreground));
}

.fragment-context-item dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
