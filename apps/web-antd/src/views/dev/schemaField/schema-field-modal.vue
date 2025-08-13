<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 6 }">
      <FormItem label="数据模型" v-bind="validateInfos.schemaId">
        <Select v-model:value="formData.schemaId" :options="props.schemaOptions"
                :field-names="{ label: 'name', value: 'id' }"
                :get-popup-container="getPopupContainer"
                :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="字段描述" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="字段名称" v-bind="validateInfos.name">
        <Input v-model:value="formData.name" :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="字段编码" v-bind="validateInfos.code">
        <Input v-model:value="formData.code" :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="字段类型" v-bind="validateInfos.type">
        <Select v-model:value="formData.type" :options="typeOptions"
                :get-popup-container="getPopupContainer"
                :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="字段注释">
        <Input v-model:value="formData.comment" placeholder="请输入字段注释"/>
      </FormItem>
      <FormItem label="字段长度">
        <InputNumber v-model:value="formData.length" :min="0" placeholder="请输入字段长度"
                     class="w-full"/>
      </FormItem>
      <FormItem label="小数位数">
        <InputNumber v-model:value="formData.scale" :min="0" placeholder="请输入小数位数"
                     class="w-full"/>
      </FormItem>
      <FormItem label="默认值">
        <Input v-model:value="formData.defaultValue" placeholder="请输入默认值"/>
      </FormItem>
      <FormItem label="排序">
        <InputNumber v-model:value="formData.sort" :min="0" placeholder="请输入排序"
                     class="w-full"/>
      </FormItem>
      <FormItem label="是否主键">
        <Switch v-model:checked="formData.isPk" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="是否必填">
        <Switch v-model:checked="formData.isRequired" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="列表显示">
        <Switch v-model:checked="formData.isList" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="查询显示">
        <Switch v-model:checked="formData.isQuery" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="插入显示">
        <Switch v-model:checked="formData.isInsert" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="编辑显示">
        <Switch v-model:checked="formData.isEdit" checked-value="1" un-checked-value="0"/>
      </FormItem>
      <FormItem label="查询方式">
        <Select v-model:value="formData.queryType" :options="queryTypeOptions"
                :get-popup-container="getPopupContainer"
                placeholder="请选择查询方式"/>
      </FormItem>
      <FormItem label="显示类型">
        <Select v-model:value="formData.htmlType" :options="htmlTypeOptions"
                :get-popup-container="getPopupContainer"
                placeholder="请选择显示类型"/>
      </FormItem>
      <FormItem label="字典类型">
        <Input v-model:value="formData.dictType" placeholder="请输入字典类型"/>
      </FormItem>
    </Form>
  </BasicModal>
</template>

<script setup lang="ts">
import type {RuleObject} from 'ant-design-vue/es/form';
import {computed, onMounted, ref} from 'vue';

import type {SchemaFieldForm} from '#/api/dev/schemaField/schemaField';
import {addSchemaField, updateSchemaField,} from '#/api/dev/schemaField/schemaField';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {cloneDeep, getPopupContainer} from '@vben/utils';

import {Form, FormItem, Input, InputNumber, Select, Switch} from 'ant-design-vue';
import {pick} from 'lodash-es';
import {schemaList} from '#/api/dev/schema/schema';
import type {SchemaInfo} from '#/api/dev/schema/types';

// const root = process.cwd()

const emit = defineEmits<{ reload: [] }>();
const props = defineProps<{
  schemaOptions: SchemaInfo[]
}>();

const isUpdate = ref(false);
const schemaOptions = ref<SchemaInfo[]>([]);

const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<SchemaFieldForm> = {
  id: undefined,
  schemaId: undefined,
  schemaName: undefined,
  name: undefined,
  code: undefined,
  type: 'varchar',
  comment: undefined,
  length: 255,
  scale: 0,
  defaultValue: undefined,
  isPk: '0',
  isRequired: '0',
  sort: 0,
  isList: '1',
  isQuery: '1',
  isInsert: '1',
  isEdit: '1',
  queryType: 'EQ',
  htmlType: 'input',
  dictType: undefined,
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
const formRules = ref<AntdFormRules<SchemaFieldForm>>({
  name: [{required: true, message: '字段描述不能为空'}],
  code: [{required: true, message: '字段编码不能为空'}],
  type: [{required: true, message: '字段类型不能为空'}],
  schemaId: [{required: true, message: '请选择数据模型', trigger: 'change'}],
});

/**
 * useForm解构出表单方法
 */
const {validate, validateInfos, resetFields} = Form.useForm(
  formData,
  formRules,
);

// 字段类型选项
const typeOptions = [
  {label: 'varchar', value: 'varchar'},
  {label: 'char', value: 'char'},
  {label: 'text', value: 'text'},
  {label: 'int', value: 'int'},
  {label: 'bigint', value: 'bigint'},
  {label: 'decimal', value: 'decimal'},
  {label: 'datetime', value: 'datetime'},
  {label: 'date', value: 'date'},
  {label: 'timestamp', value: 'timestamp'},
  {label: 'tinyint', value: 'tinyint'},
];

// 查询方式选项
const queryTypeOptions = [
  {label: '等于', value: 'EQ'},
  {label: '不等于', value: 'NE'},
  {label: '大于', value: 'GT'},
  {label: '大于等于', value: 'GTE'},
  {label: '小于', value: 'LT'},
  {label: '小于等于', value: 'LTE'},
  {label: '模糊查询', value: 'LIKE'},
  {label: '左模糊查询', value: 'LIKE_LEFT'},
  {label: '右模糊查询', value: 'LIKE_RIGHT'},
  {label: '包含', value: 'IN'},
  {label: '不包含', value: 'NOT_IN'},
  {label: '为空', value: 'IS_NULL'},
  {label: '不为空', value: 'IS_NOT_NULL'},
  {label: '范围查询', value: 'BETWEEN'},
];

// 显示类型选项
const htmlTypeOptions = [
  {label: '文本框', value: 'input'},
  {label: '文本域', value: 'textarea'},
  {label: '下拉框', value: 'select'},
  {label: '单选框', value: 'radio'},
  {label: '复选框', value: 'checkbox'},
  {label: '日期时间控件', value: 'datetime'},
  {label: '日期控件', value: 'date'},
  {label: '时间控件', value: 'time'},
  {label: '图片上传', value: 'imageUpload'},
  {label: '文件上传', value: 'fileUpload'},
  {label: '富文本控件', value: 'editor'},
];

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

    const {record, schemaId: currentSchemaId} = modalApi.getData() as {
      record?: SchemaFieldForm;
      schemaId?: number;
    };
    isUpdate.value = !!record;

    if (isUpdate.value && record) {
      // 只赋值存在的字段
      formData.value = pick(record, Object.keys(defaultValues));
    } else {
      formData.value = {...defaultValues, schemaId: currentSchemaId};
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
    await (isUpdate.value ? updateSchemaField(data) : addSchemaField(data));
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

// 获取模型列表
const loadSchemaOptions = async () => {
  try {
    const response = await schemaList({pageSize: 1000});
    schemaOptions.value = response.rows || [];
  } catch (error) {
    console.error('获取模型列表失败:', error);
  }
};

// 组件挂载时加载模型列表
onMounted(() => {
  loadSchemaOptions();
  // console.log("root" + root);
});
</script>
