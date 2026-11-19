<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { ID } from '#/api/common';
import type { FragmentForm } from '#/api/knowledge/fragment/model';

import { computed, ref, shallowRef } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Form, FormItem, InputNumber, Textarea } from 'ant-design-vue';

import {
  fragmentAdd,
  fragmentInfo,
  fragmentUpdate,
} from '#/api/knowledge/fragment';
import { Tinymce } from '#/components/tinymce';

interface FragmentScope {
  attachmentName: string;
  docId: string;
  id?: ID;
  knowledgeId: string;
}

const emit = defineEmits<{ reload: [] }>();
const formData = ref<FragmentForm>({});
const scope = shallowRef<FragmentScope>();
const formReady = shallowRef(false);
const formError = shallowRef('');
let revision = 0;

const rules: Partial<Record<keyof FragmentForm, RuleObject[]>> = {
  idx: [{ required: true, message: '请填写片段序号' }],
  content: [{ required: true, message: '请填写片段内容' }],
};
const { validate, validateInfos, clearValidate } = Form.useForm(
  formData,
  rules,
);
const title = computed(() =>
  scope.value?.id === undefined ? '新增知识片段' : '编辑知识片段',
);

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[550px]',
  closeOnClickModal: false,
  fullscreenButton: false,
  onConfirm: handleConfirm,
  async onOpenChange(open) {
    const currentRevision = ++revision;
    if (!open) {
      scope.value = undefined;
      modalApi.modalLoading(false);
      return;
    }

    const context = modalApi.getData<FragmentScope>();
    const { docId, id, knowledgeId } = context;
    scope.value = context;
    formData.value = {};
    formReady.value = false;
    formError.value = '';
    clearValidate();
    if (!docId || !knowledgeId) {
      formError.value = '请先选择附件。';
      return;
    }
    if (id === undefined) {
      formReady.value = true;
      return;
    }

    modalApi.modalLoading(true);
    try {
      const record = await fragmentInfo(id);
      if (currentRevision !== revision) return;
      if (
        String(record?.knowledgeId) !== knowledgeId ||
        record?.docId !== docId
      ) {
        formError.value = '当前附件中找不到该片段。';
        return;
      }
      const { content, idx, remark } = record;
      formData.value = { content, idx, remark };
      formReady.value = true;
    } catch {
      if (currentRevision === revision) {
        formError.value = '片段加载失败，请关闭后重试。';
      }
    } finally {
      if (currentRevision === revision) modalApi.modalLoading(false);
    }
  },
});

async function handleConfirm() {
  const context = scope.value;
  if (!formReady.value || !context) return;
  try {
    modalApi.lock(true);
    await validate();
    const { docId, id, knowledgeId } = context;
    const data: FragmentForm = { ...formData.value, docId, id, knowledgeId };
    if (id === undefined) {
      await fragmentAdd(data);
    } else {
      await fragmentUpdate(data);
    }
    emit('reload');
    await modalApi.close();
  } catch {
    // 字段校验和请求错误由表单及请求客户端显示。
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal :title="title" :confirm-disabled="!formReady">
    <p v-if="formError" role="status">{{ formError }}</p>
    <Form v-else layout="vertical">
      <FormItem label="来源附件">
        <span class="break-all">{{ scope?.attachmentName }}</span>
      </FormItem>
      <FormItem label="片段序号" v-bind="validateInfos.idx">
        <InputNumber v-model:value="formData.idx" :min="0" class="w-full" />
      </FormItem>
      <FormItem label="片段内容" v-bind="validateInfos.content">
        <Tinymce v-model="formData.content" :options="{ readonly: false }" />
      </FormItem>
      <FormItem label="备注" v-bind="validateInfos.remark">
        <Textarea v-model:value="formData.remark" :rows="4" />
      </FormItem>
    </Form>
  </BasicModal>
</template>
