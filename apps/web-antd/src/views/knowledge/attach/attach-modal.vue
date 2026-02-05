<!--
使用 Ant Design Vue 原生 Form 组件生成表单
详细用法参考: https://antdv.com/components/form-cn
注意: 如果 VSCode 配置了自动移除未使用的导入，可能会误删某些组件导入
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { AttachForm } from '#/api/knowledge/attach/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Form,
  FormItem,
  Input,
  Textarea,
  Select,
  InputNumber,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { attachAdd, attachInfo, attachUpdate } from '#/api/knowledge/attach';
import { Tinymce } from '#/components/tinymce';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<AttachForm> = {
  id: undefined,
  knowledgeId: undefined,
  name: undefined,
  type: undefined,
  ossId: undefined,
  content: undefined,
  remark: undefined,
};

/**
 * 表单数据ref
 */
const formData = ref(defaultValues);

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<AttachForm>>({
  knowledgeId: [{ required: true, message: '知识库ID不能为空' }],
  name: [{ required: true, message: '附件名称不能为空' }],
  type: [{ required: true, message: '附件类型不能为空' }],
});

const attachTypeOptions = [
  { label: 'txt', value: 'txt' },
  { label: 'pdf', value: 'pdf' },
  { label: 'docx', value: 'docx' },
  { label: 'xlsx', value: 'xlsx' },
  { label: 'xls', value: 'xls' },
  { label: 'csv', value: 'csv' },
  { label: 'json', value: 'json' },
  { label: 'pptx', value: 'pptx' },
];

/**
 * useForm解构出表单方法
 */
const { validate, validateInfos, resetFields } = Form.useForm(
  formData,
  formRules,
);

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[550px]',
  fullscreenButton: false,
  closeOnClickModal: false,
  onClosed: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await attachInfo(id);
      // 只赋值存在的字段
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = filterRecord;
    }

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.modalLoading(true);
    await validate();
    // 可能会做数据处理 使用cloneDeep深拷贝
    const data = cloneDeep(formData.value);
    await (isUpdate.value ? attachUpdate(data) : attachAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  formData.value = cloneDeep(defaultValues);
  resetFields();
}
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="知识库ID" v-bind="validateInfos.knowledgeId">
        <Input
          v-model:value="formData.knowledgeId"
          type="number"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="附件名称" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="附件类型" v-bind="validateInfos.type">
        <Select
          v-model:value="formData.type"
          :options="attachTypeOptions"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="对象存储ID" v-bind="validateInfos.ossId">
        <Input
          v-model:value="formData.ossId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="文档内容" v-bind="validateInfos.content">
        <Tinymce :options="{ readonly: false }" v-model="formData.content" />
      </FormItem>
      <FormItem label="备注" v-bind="validateInfos.remark">
        <Textarea
          v-model:value="formData.remark"
          :placeholder="$t('ui.formRules.required')"
          :rows="4"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
