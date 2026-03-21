<!--
使用 Ant Design Vue 原生 Form 组件生成表单
详细用法参考: https://antdv.com/components/form-cn
注意: 如果 VSCode 配置了自动移除未使用的导入，可能会误删某些组件导入
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import { computed, ref } from 'vue';

import { Input, Textarea, Select, RadioGroup, CheckboxGroup, DatePicker, Form, FormItem } from 'ant-design-vue';
import { ImageUpload, FileUpload } from '#/components/upload';
import { Tinymce } from '#/components/tinymce';
import { getPopupContainer } from '@vben/utils';
import { pick } from 'lodash-es';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';
import { DictEnum } from '@vben/constants';

import { useVbenForm } from '#/adapter/form';
import { messageAdd, messageInfo, messageUpdate } from '#/api/chat/message';
import type { MessageForm } from '#/api/chat/message/model';
import { getDictItems } from '#/api/system/dict';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

// 计费类型字典选项
const billingTypeOptions = ref<Array<{ label: string; value: string }>>([]);

// 获取计费类型字典数据
async function fetchBillingTypeDict() {
  try {
    const dictData = await getDictItems(DictEnum.SYS_MODEL_BILLING);
    billingTypeOptions.value = dictData.map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }));
  } catch (error) {
    console.error('获取计费类型字典失败:', error);
  }
}

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<MessageForm> = {
  id: undefined,
  sessionId: undefined,
  userId: undefined,
  content: undefined,
  role: undefined,
  deductCost: undefined,
  totalTokens: undefined,
  modelName: undefined,
  billingType: undefined,
  remark: undefined,
}

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
    userId: [
      { required: true, message: "用户id不能为空" }
    ],
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

    // 初始化字典数据
    if (billingTypeOptions.value.length === 0) {
      await fetchBillingTypeDict();
    }

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
  formData.value = cloneDeep(defaultValues);
  resetFields();
}
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="会话id" v-bind="validateInfos.sessionId">
        <Input v-model:value="formData.sessionId" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="用户id" v-bind="validateInfos.userId">
        <Input v-model:value="formData.userId" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="消息内容" v-bind="validateInfos.content">
        <Tinymce
          :options="{ readonly: false }"
          v-model="formData.content"
        />
      </FormItem>
      <FormItem label="对话角色" v-bind="validateInfos.role">
        <Input v-model:value="formData.role" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="扣除金额" v-bind="validateInfos.deductCost">
        <Input v-model:value="formData.deductCost" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="累计 Tokens" v-bind="validateInfos.totalTokens">
        <Input v-model:value="formData.totalTokens" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="模型名称" v-bind="validateInfos.modelName">
        <Input v-model:value="formData.modelName" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem label="计费类型" v-bind="validateInfos.billingType">
        <Select
          v-model:value="formData.billingType"
          :options="billingTypeOptions"
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

