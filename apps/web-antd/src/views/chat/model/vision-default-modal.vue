<script setup lang="ts">
import type { VisionDefaultSettings } from '#/api/chat/model/model';

import { computed, onBeforeUnmount, shallowRef } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';

import { Button, FormItem, Select } from 'ant-design-vue';

import { getVisionDefault, updateVisionDefault } from '#/api/chat/model';

const { hasAccessByCodes } = useAccess();
const canEdit = computed(() => hasAccessByCodes(['system:model:edit']));
const settings = shallowRef<VisionDefaultSettings>();
const selected = shallowRef<string>();
const loadFailed = shallowRef(false);
const saving = shallowRef(false);
const saveError = shallowRef('');

let pendingLoad: AbortController | undefined;

const loading = computed(() => !settings.value && !loadFailed.value);
const options = computed(() =>
  (settings.value?.options ?? []).map((model) => {
    const description = model.modelDescribe?.trim();
    const { modelName } = model;
    return {
      label:
        description && description !== modelName
          ? `${description}（${modelName}）`
          : modelName,
      value: modelName,
    };
  }),
);
const unavailableModel = computed(() => {
  const current = settings.value?.modelName;
  return current && !options.value.some((option) => option.value === current)
    ? current
    : undefined;
});
const canSave = computed(
  () =>
    canEdit.value &&
    Boolean(selected.value) &&
    selected.value !== settings.value?.modelName &&
    options.value.some((option) => option.value === selected.value),
);

const [BasicModal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onOpenChange(open) {
    if (open) {
      void loadSettings();
    } else {
      pendingLoad?.abort();
    }
  },
});

onBeforeUnmount(() => pendingLoad?.abort());

async function loadSettings() {
  pendingLoad?.abort();
  const controller = new AbortController();
  pendingLoad = controller;
  settings.value = undefined;
  selected.value = undefined;
  loadFailed.value = false;
  saveError.value = '';

  try {
    const result = await getVisionDefault(controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    settings.value = result;
    if (result.options.some((model) => model.modelName === result.modelName)) {
      selected.value = result.modelName ?? undefined;
    }
  } catch {
    if (!controller.signal.aborted) {
      loadFailed.value = true;
    }
  }
}

async function handleConfirm() {
  const modelName = selected.value;
  if (!modelName || !canSave.value || saving.value) {
    return;
  }
  saveError.value = '';
  saving.value = true;
  modalApi.lock(true);

  try {
    await updateVisionDefault(modelName);
    await modalApi.close();
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : '保存失败，请重试。';
  } finally {
    saving.value = false;
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal
    title="默认视觉模型"
    class="w-[480px]"
    confirm-text="保存"
    :cancel-text="canEdit ? '取消' : '关闭'"
    :confirm-disabled="!canSave || saving"
    :show-confirm-button="canEdit"
  >
    <div v-if="loadFailed" class="flex flex-wrap items-center gap-2">
      <span role="status">模型列表加载失败。</span>
      <Button type="link" size="small" @click="loadSettings">重试</Button>
    </div>
    <FormItem v-else label="模型" html-for="default-vision-model">
      <Select
        id="default-vision-model"
        v-model:value="selected"
        :disabled="!canEdit || loading || saving || options.length === 0"
        :loading="loading"
        :options="options"
        :placeholder="
          loading ? '正在加载模型…' : canEdit ? '请选择视觉模型' : '未配置'
        "
        option-filter-prop="label"
        show-search
      />
      <div class="text-muted-foreground mt-2 text-sm">
        当前模型未开启「支持识图」时，带图消息由默认视觉模型回答。
      </div>
      <p v-if="unavailableModel" class="mt-2 text-sm" role="status">
        当前设置的模型 {{ unavailableModel }} 已不可用。
        <template v-if="canEdit && options.length > 0">
          请选择其他模型。
        </template>
      </p>
      <p
        v-if="!loading && options.length === 0"
        class="mt-2 text-sm"
        role="status"
      >
        暂无已开启「支持识图」的可用聊天模型。
      </p>
      <div v-if="saveError" class="mt-2 flex flex-wrap items-center gap-2">
        <span class="text-destructive" role="status">{{ saveError }}</span>
        <Button type="link" size="small" @click="loadSettings">刷新模型</Button>
      </div>
    </FormItem>
  </BasicModal>
</template>
