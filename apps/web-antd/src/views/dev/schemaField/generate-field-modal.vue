<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 5 }">
      <FormItem label="表名" v-bind="validateInfos.tableName">
        <Input v-model:value="formData.tableName" :placeholder="$t('ui.formRules.required')"
               disabled/>
      </FormItem>
      <FormItem label="是否覆盖" v-bind="validateInfos.isCover">
        <RadioGroup v-model:value="formData.isCover">
          <RadioButton :value="true">是</RadioButton>
          <RadioButton :value="false">否</RadioButton>
        </RadioGroup>
      </FormItem>
      <FormItem label="生成类型" v-bind="validateInfos.genType">
        <RadioGroup v-model:value="formData.genType">
          <RadioButton value="frontend">前端</RadioButton>
          <RadioButton value="backend">后端</RadioButton>
          <RadioButton value="all">全部</RadioButton>
        </RadioGroup>
      </FormItem>
      <FormItem label="本地前端路径" v-bind="validateInfos.workPath">
        <Input v-model:value="formData.workPath" :placeholder="$t('ui.formRules.required')"/>
      </FormItem>
      <FormItem label="自定义数据" v-bind="validateInfos.data">
        <Input v-model:value="formData.data"/>
      </FormItem>
      <FormItem label="预览指令" v-bind="validateInfos.previewCode">
        <Textarea v-model:value="formData.previewCode" auto-size disabled/>
      </FormItem>
    </Form>
  </BasicModal>
</template>

<script setup lang="ts">
import type {RuleObject} from 'ant-design-vue/es/form';

import {computed, ref, watch} from 'vue';

import {useVbenModal} from '@vben/common-ui';
import {$t} from '@vben/locales';
import {cloneDeep} from '@vben/utils';

import {Form, FormItem, Input, RadioButton, RadioGroup, Textarea} from 'ant-design-vue';
import {pick} from 'lodash-es';
import type {SchemaGenerateParams} from '#/api/dev/schema/types';

const emit = defineEmits<{
  (e: 'handleGen', params: SchemaGenerateParams): void
}>();
const isUpdate = ref(false);

const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<SchemaGenerateParams> = {
  isCover: true,
  tableName: '',
  workPath: '',
  genType: 'all'
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
const formRules = ref<AntdFormRules<SchemaGenerateParams>>({
  tableName: [{required: true, message: '表名不能为空'}],
  workPath: [{required: true, message: '本地前端路径不能为空'}],
  genType: [{required: true, message: '生成类型不能为空'}],
});

/**
 * useForm解构出表单方法
 */
const {validate, validateInfos, resetFields} = Form.useForm(
  formData,
  formRules,
);

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

    const {record, tableName} = modalApi.getData() as {
      record?: SchemaGenerateParams;
      tableName?: string;
    };
    isUpdate.value = !!record;

    if (isUpdate.value && record) {
      // 只赋值存在的字段
      formData.value = pick(record, Object.keys(defaultValues));
    } else {
      formData.value = {
        ...defaultValues,
        tableName,
        workPath: localStorage.getItem("gen_work_path") || ''
      };
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
    localStorage.setItem("gen_work_path", data.workPath!)
    emit('handleGen', data);
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

// 生成指令
function generateCommand(formData: SchemaGenerateParams): string {
  let cmd = `pnpm generate --tableName=${formData.tableName}`;

  if (formData.isCover) {
    cmd += ' --cover=1';
  }

  if (formData.data) {
    // 转义单引号，防止命令行出错
    const safeData = formData.data.replace(/'/g, `'\\''`);
    cmd += ` --data='${safeData}'`;
  }

  return cmd;
}

watch(
  () => [formData.value.tableName, formData.value.isCover, formData.value.data],
  () => {
    formData.value.previewCode = generateCommand(formData.value);
  },
  {immediate: true}
);

</script>
