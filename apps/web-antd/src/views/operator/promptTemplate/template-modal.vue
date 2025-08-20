<script setup lang="ts">
import type {RuleObject} from 'ant-design-vue/es/form';

import type {TemplateForm} from '#/api/operator/promptTemplate/model';

import {computed, ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {cloneDeep, getPopupContainer} from '@vben/utils';

import {Form, FormItem, Input, Select, Textarea} from 'ant-design-vue';

import {pick} from 'lodash-es';

import {DictEnum} from '@vben/constants';
import {getDictOptions} from '#/utils/dict';

import {templateAdd, templateInfo, templateUpdate,} from '#/api/operator/promptTemplate';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<TemplateForm> = {
  id: undefined,
  templateName: undefined,
  templateContent: undefined,
  category: undefined,
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
const formRules = ref<AntdFormRules<TemplateForm>>({
  templateName: [{required: true, message: '提示词模板名称不能为空'}],
  templateContent: [{required: true, message: '提示词模板内容不能为空'}],
  category: [
    {
      required: true,
      message: '提示词分类',
    },
  ],
  remark: [{required: true, message: '备注不能为空'}],
});

/**
 * useForm解构出表单方法
 */
const {validate, validateInfos, resetFields} = Form.useForm(
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

    const {id} = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await templateInfo(id);
      // 只赋值存在的字段
      formData.value = pick(record, Object.keys(defaultValues));
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
    await (isUpdate.value ? templateUpdate(data) : templateAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  await modalApi.close();
  formData.value = defaultValues;
  resetFields();
}

const getType = getDictOptions(DictEnum.PROMPT_TEMPLATE_TYPE);
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 6 }">
      <FormItem label="提示词模板名称" v-bind="validateInfos.templateName">
        <Input
          v-model:value="formData.templateName"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="提示词模板内容" v-bind="validateInfos.templateContent">
        <Textarea
          v-model:value="formData.templateContent"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="提示词分类" v-bind="validateInfos.category">
        <Select
          v-model:value="formData.category"
          :options="getType"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="备注" v-bind="validateInfos.remark">
        <Textarea
          v-model:value="formData.remark"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
