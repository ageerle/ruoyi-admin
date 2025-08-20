<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { MessageForm } from '#/api/operator/message/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import {cloneDeep, getPopupContainer} from '@vben/utils';

import {Form, FormItem, Input, Select, Textarea} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { messageAdd, messageInfo, messageUpdate } from '#/api/operator/message';
import { Tinymce } from '#/components/tinymce';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<MessageForm> = {
  id: undefined,
  userId: undefined,
  content: undefined,
  role: undefined,
  deductCost: undefined,
  totalTokens: undefined,
  modelName: undefined,
  billingType: undefined,
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
const formRules = ref<AntdFormRules<MessageForm>>({
  userId: [{ required: true, message: '用户id不能为空' }],
  content: [{ required: true, message: '消息内容不能为空' }],
  role: [{ required: true, message: '对话角色不能为空' }],
  deductCost: [{ required: true, message: '扣除金额不能为空' }],
  totalTokens: [{ required: true, message: '累计 Tokens不能为空' }],
  modelName: [{ required: true, message: '模型名称不能为空' }],
  billingType: [{ required: true, message: '计费类型不能为空' }],
  remark: [{ required: true, message: '备注不能为空' }],
});

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
      const record = await messageInfo(id);
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
    await (isUpdate.value ? messageUpdate(data) : messageAdd(data));
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
  formData.value = defaultValues;
  resetFields();
}

const getBillingType = ref([
  { label: 'token计费', value: '1' },
  { label: '次数计费', value: '2' },
]);
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="用户id" v-bind="validateInfos.userId">
        <Input
          v-model:value="formData.userId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="消息内容" v-bind="validateInfos.content">
        <Tinymce :options="{ readonly: false }" v-model="formData.content" />
      </FormItem>
      <FormItem label="对话角色" v-bind="validateInfos.role">
        <Input
          v-model:value="formData.role"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem
        label="扣除金额

"
        v-bind="validateInfos.deductCost"
      >
        <Input
          v-model:value="formData.deductCost"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="累计 Tokens" v-bind="validateInfos.totalTokens">
        <Input
          v-model:value="formData.totalTokens"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="模型名称" v-bind="validateInfos.modelName">
        <Input
          v-model:value="formData.modelName"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="计费类型" v-bind="validateInfos.billingType">
        <Select
          v-model:value="formData.billingType"
          :options="getBillingType"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
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
