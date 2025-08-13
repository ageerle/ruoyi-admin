<script setup lang="ts">
import type {RuleObject} from 'ant-design-vue/es/form';

import {computed, ref} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {cloneDeep, getPopupContainer} from '@vben/utils';

import {Form, FormItem, Input, Select, Textarea} from 'ant-design-vue';
import {pick} from 'lodash-es';
import {getDataNames, schemaAdd, schemaInfo, schemaUpdate,} from '#/api/dev/schema/schema';
import {devSchemaGroupSelect} from '#/api/dev/schemaGroup/schemaGroup';
import type {SchemaInfo} from '#/api/dev/schema/types';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<SchemaInfo> = {
  id: undefined,
  schemaGroupId: undefined,
  name: undefined,
  tableName: undefined,
  comment: undefined,
  remark: undefined,
};

/**
 * 表单数据ref
 */
const formData = ref(defaultValues);
const schemaGroupOptions = ref<Array<{ label: string; value: number }>>([]);
const tableNameOptions = ref<Array<{ label: string; value: string }>>([]);

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<SchemaInfo>>({
  name: [{required: true, message: '模型名称不能为空'}],
  tableName: [{required: true, message: '表名不能为空'}],
  schemaGroupId: [{required: true, message: '请选择分组'}],
});

/**
 * useForm解构出表单方法
 */
const {validate, validateInfos, resetFields} = Form.useForm(
  formData,
  formRules,
);

// 获取分组选项
async function loadSchemaGroups() {
  try {
    const data = await devSchemaGroupSelect();
    schemaGroupOptions.value = data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('获取分组列表失败:', error);
  }
}

// 获取数据表名选项
async function loadTableNames() {
  try {
    const data = await getDataNames();
    tableNameOptions.value = data.map((name: string) => ({
      label: name,
      value: name,
    }));
  } catch (error) {
    console.error('获取数据表名列表失败:', error);
  }
}

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[600px]',
  fullscreenButton: false,
  closeOnClickModal: false,
  onClosed: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    await loadSchemaGroups();
    await loadTableNames();

    const {id} = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await schemaInfo(id);
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
    await (isUpdate.value ? schemaUpdate(data) : schemaAdd(data));
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
      <FormItem label="分组" v-bind="validateInfos.schemaGroupId">
        <Select v-model:value="formData.schemaGroupId" :options="schemaGroupOptions"
                :get-popup-container="getPopupContainer" placeholder="请选择分组"/>
      </FormItem>
      <FormItem label="菜单名称" v-bind="validateInfos.name">
        <Input v-model:value="formData.name" :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="表名" v-bind="validateInfos.tableName">
        <Select v-model:value="formData.tableName" :options="tableNameOptions"
                :get-popup-container="getPopupContainer"
                :placeholder="$t('ui.formRules.required')" show-search :filter-option="(input: string, option: any) => {
            return option.label.toLowerCase().includes(input.toLowerCase());
          }"/>
      </FormItem>
      <FormItem label="备注">
        <Textarea v-model:value="formData.remark" placeholder="请输入备注"/>
      </FormItem>
    </Form>
  </BasicModal>
</template>
