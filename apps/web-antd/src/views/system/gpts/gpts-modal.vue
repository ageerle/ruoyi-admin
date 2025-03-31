<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { GptsForm } from '#/api/system/gpts/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import { Form, FormItem, Input, Select, Textarea } from 'ant-design-vue';
import { pick } from 'lodash-es';

import { gptsAdd, gptsInfo, gptsUpdate } from '#/api/system/gpts';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<GptsForm> = {
  id: undefined,
  gid: undefined,
  name: undefined,
  logo: undefined,
  info: undefined,
  authorId: undefined,
  authorName: undefined,
  useCnt: undefined,
  bad: undefined,
  type: undefined,
  remark: undefined,
  updateIp: undefined,
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
const formRules = ref<AntdFormRules<GptsForm>>({
  gid: [{ required: true, message: 'gpts应用id不能为空' }],
  name: [{ required: true, message: 'gpts应用名称不能为空' }],
  logo: [{ required: true, message: 'gpts图标不能为空' }],
  info: [{ required: true, message: 'gpts描述不能为空' }],
  authorId: [{ required: true, message: '作者id不能为空' }],
  authorName: [{ required: true, message: '作者名称不能为空' }],
  useCnt: [{ required: true, message: '点赞不能为空' }],
  bad: [{ required: true, message: '差评不能为空' }],
  type: [{ required: true, message: '类型不能为空' }],
  remark: [{ required: true, message: '备注不能为空' }],
  updateIp: [{ required: true, message: '更新IP不能为空' }],
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
      const record = await gptsInfo(id);
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
    await (isUpdate.value ? gptsUpdate(data) : gptsAdd(data));
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
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="gpts应用id" v-bind="validateInfos.gid">
        <Input
          v-model:value="formData.gid"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="gpts应用名称" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="gpts图标" v-bind="validateInfos.logo">
        <Input
          v-model:value="formData.logo"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="gpts描述" v-bind="validateInfos.info">
        <Input
          v-model:value="formData.info"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="作者id" v-bind="validateInfos.authorId">
        <Input
          v-model:value="formData.authorId"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="作者名称" v-bind="validateInfos.authorName">
        <Input
          v-model:value="formData.authorName"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="点赞" v-bind="validateInfos.useCnt">
        <Input
          v-model:value="formData.useCnt"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="差评" v-bind="validateInfos.bad">
        <Input
          v-model:value="formData.bad"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="类型" v-bind="validateInfos.type">
        <Select
          v-model:value="formData.type"
          :options="[]"
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
      <FormItem label="更新IP" v-bind="validateInfos.updateIp">
        <Input
          v-model:value="formData.updateIp"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
