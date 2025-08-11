<script setup lang="ts">
import type {RuleObject} from 'ant-design-vue/es/form';
import type {SchemaGroupForm} from '#/api/dev/schemaGroup/schemaGroup';
import {devSchemaGroupDetail, devSchemaGroupSaveOrUpdate,} from '#/api/dev/schemaGroup/schemaGroup';

import {computed, ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {cloneDeep} from '@vben/utils';

import {Form, FormItem, Input, InputNumber, Textarea} from 'ant-design-vue';
import {pick} from 'lodash-es';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<SchemaGroupForm> = {
  id: undefined,
  name: undefined,
  code: undefined,
  icon: undefined,
  sort: 0,
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
const formRules = ref<AntdFormRules<SchemaGroupForm>>({
  name: [{required: true, message: '分组名称不能为空'}],
  code: [{required: true, message: '唯一编码不能为空'}],
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
      const record = await devSchemaGroupDetail({id: String(id)});
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
    await devSchemaGroupSaveOrUpdate(data, isUpdate.value);
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
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" class="mt-4">
      <FormItem label="分组名称" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          placeholder="请输入分组名称"
        />
      </FormItem>
      <FormItem label="唯一编码" v-bind="validateInfos.code">
        <Input
          v-model:value="formData.code"
          placeholder="请输入唯一编码"
        />
      </FormItem>
      <FormItem label="图标">
        <Input
          v-model:value="formData.icon"
          placeholder="请输入图标"
        />
      </FormItem>
      <FormItem label="备注">
        <Textarea
          v-model:value="formData.remark"
          placeholder="请输入备注"
          :rows="3"
        />
      </FormItem>
    </Form>
  </BasicModal>
</template>
