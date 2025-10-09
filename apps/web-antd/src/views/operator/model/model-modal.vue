<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { ModelForm } from '#/api/operator/model/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, getPopupContainer } from '@vben/utils';

import {
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Textarea,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { modelAdd, modelInfo, modelUpdate } from '#/api/operator/model';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<ModelForm> = {
  id: undefined,
  category: undefined,
  modelName: undefined,
  modelDescribe: undefined,
  modelPrice: undefined,
  priority: 1,
  modelType: undefined,
  modelShow: undefined,
  systemPrompt: undefined,
  apiHost: undefined,
  apiKey: undefined,
  remark: undefined,
  providerName: undefined,
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
const formRules = ref<AntdFormRules<ModelForm>>({
  modelName: [{ required: true, message: '模型名称不能为空' }],
  modelDescribe: [{ required: true, message: '模型描述不能为空' }],
  modelPrice: [{ required: true, message: '模型价格不能为空' }],
  modelType: [{ required: true, message: '计费类型不能为空' }],
  modelShow: [{ required: true, message: '是否显示不能为空' }],
  apiHost: [{ required: true, message: '请求地址不能为空' }],
  apiKey: [{ required: true, message: '密钥不能为空' }],
  providerName: [
    {
      validator: async (_rule, value) => {
        if (formData.value.category === 'vector' && !value) {
          return Promise.reject('请选择模型供应商');
        }
        return Promise.resolve();
      },
    },
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

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await modelInfo(id);
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
    await (isUpdate.value ? modelUpdate(data) : modelAdd(data));
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

const getmodelShow = ref([
  { label: '隐藏', value: '1' },
  { label: '显示', value: '0' },
]);

const getmodelType = ref([
  { label: 'token计费', value: '1' },
  { label: '次数计费', value: '2' },
]);

const getModelCategory = ref([
  { label: '本地部署模型-ollama', value: 'ollama' },
  { label: '中转模型-chat', value: 'chat' },
  { label: 'DIFY-dify', value: 'dify' },
  { label: '扣子-coze', value: 'coze' },
  { label: '智谱清言-zhipu', value: 'zhipu' },
  { label: '深度求索-deepseek', value: 'deepseek' },
  { label: '通义千问-qianwen', value: 'qianwen' },
  { label: '知识库向量模型-vector', value: 'vector' },
  { label: '图片识别模型-image', value: 'image' },
  { label: 'FASTGPT-fastgpt', value: 'fastgpt' },
]);

const getProviderCategory = ref([
  { label: 'ollama', value: 'ollama' },
  { label: '阿里云百链', value: 'bailianTextModel' },
  { label: '阿里云百链(多模态)', value: 'bailianMultiModel' },
  { label: '智普', value: 'zhipu' },
  { label: '硅基流动', value: 'siliconflow' },
  { label: 'OpenAi', value: 'openai' },
]);
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="模型分类" v-bind="validateInfos.category">
        <Select
          v-model:value="formData.category"
          :options="getModelCategory"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem
        v-if="formData.category === 'vector'"
        label="模型供应商"
        v-bind="validateInfos.providerName"
        :rules="[{ required: true, message: '请选择模型供应商' }]"
      >
        <Select
          v-model:value="formData.providerName"
          :options="getProviderCategory"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>
      <FormItem label="模型名称" v-bind="validateInfos.modelName">
        <Input
          v-model:value="formData.modelName"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="模型描述" v-bind="validateInfos.modelDescribe">
        <Input
          v-model:value="formData.modelDescribe"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="模型价格" v-bind="validateInfos.modelPrice">
        <Input
          v-model:value="formData.modelPrice"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="模型优先级" v-bind="validateInfos.priority">
        <InputNumber
          v-model:value="formData.priority"
          :min="1"
          :precision="0"
          placeholder="数字越大优先级越高，默认为1"
          style="width: 100%"
        />
      </FormItem>
      <FormItem label="计费类型" v-bind="validateInfos.modelType">
        <Select
          v-model:value="formData.modelType"
          :options="getmodelType"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>

      <FormItem label="是否显示" v-bind="validateInfos.modelShow">
        <Select
          v-model:value="formData.modelShow"
          :options="getmodelShow"
          :get-popup-container="getPopupContainer"
          :placeholder="$t('ui.formRules.selectRequired')"
        />
      </FormItem>

      <FormItem label="请求地址" v-bind="validateInfos.apiHost">
        <Input
          v-model:value="formData.apiHost"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>

      <FormItem label="密钥" v-bind="validateInfos.apiKey">
        <Input
          v-model:value="formData.apiKey"
          :placeholder="$t('ui.formRules.required')"
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
