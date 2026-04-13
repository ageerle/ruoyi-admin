<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import type { InfoForm } from '#/api/knowledge/info/model';

import { ref, computed } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Form,
  FormItem,
  Input,
  Select,
  Radio,
  RadioGroup,
  Switch,
  message,
} from 'ant-design-vue';

import { infoAdd } from '#/api/knowledge/info';
import { modelList } from '#/api/chat/model';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => '新增知识库');

const defaultValues: Partial<InfoForm> = {
  name: '',
  share: 0,
  description: '',
  remark: '',
  separator: '\\n',
  overlapChar: 10,
  retrieveLimit: 10,
  textBlockSize: 1000,
  vectorModel: 'weaviate',
  embeddingModel: undefined,
  enableRerank: 0,
  rerankModel: undefined,
};

const formData = ref<Partial<InfoForm>>({ ...defaultValues });

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};

const formRules = ref<AntdFormRules<InfoForm>>({
  name: [{ required: true, message: '知识库名称不能为空' }],
  share: [{ required: true, message: '请选择是否公开' }],
  embeddingModel: [{ required: true, message: '请选择向量模型' }],
});

const embeddingModelOptions = ref<Array<{ label: string; value: string }>>([]);
const rerankModelOptions = ref<Array<{ label: string; value: string }>>([]);

const shareOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

const { validate, validateInfos, resetFields } = Form.useForm(
  formData,
  formRules,
);

async function fetchEmbeddingModels() {
  try {
    const response = await modelList({ category: 'vector', pageSize: 1000 });
    const models = Array.isArray(response) ? response : (response.rows || response.records || []);
    embeddingModelOptions.value = models.map((model: any) => ({
      label: model.modelDescribe || model.modelName,
      value: model.modelName,
    }));
    if (embeddingModelOptions.value.length > 0 && !formData.value.embeddingModel) {
      formData.value.embeddingModel = embeddingModelOptions.value[0]?.value;
    }
  } catch (error) {
    console.error('Failed to fetch embedding models:', error);
  }
}

async function fetchRerankModels() {
  try {
    const response = await modelList({ category: 'rerank', pageSize: 1000 });
    const models = Array.isArray(response) ? response : (response.rows || response.records || []);
    // 过滤：仅显示后端已实现的供应商
    const supportedProviders = ['alibailian', 'siliconflow'];
    rerankModelOptions.value = models
      .filter((model: any) => supportedProviders.includes(model.providerCode?.toLowerCase()))
      .map((model: any) => ({
        label: model.modelDescribe || model.modelName,
        value: model.modelName,
      }));
  } catch (error) {
    console.error('Failed to fetch rerank models:', error);
  }
}

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[600px]',
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    modalApi.modalLoading(true);
    await Promise.all([fetchEmbeddingModels(), fetchRerankModels()]);
    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    await validate();
    const data = cloneDeep(formData.value) as InfoForm;
    await infoAdd(data);
    message.success('新增成功');
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

function handleClosed() {
  formData.value = { ...defaultValues };
  resetFields();
}
</script>

<template>
  <BasicModal :title="title">
    <Form layout="vertical">
      <FormItem label="知识库名称" v-bind="validateInfos.name">
        <Input v-model:value="formData.name" placeholder="请输入知识库名称" />
      </FormItem>
      
      <FormItem label="是否公开" v-bind="validateInfos.share">
        <RadioGroup v-model:value="formData.share" :options="shareOptions" option-type="button" button-style="solid" />
      </FormItem>

      <FormItem label="向量模型" v-bind="validateInfos.embeddingModel">
        <Select
          v-model:value="formData.embeddingModel"
          :options="embeddingModelOptions"
          placeholder="请选择向量模型"
          show-search
        />
      </FormItem>

      <FormItem label="启用重排">
        <Switch 
          v-model:checked="formData.enableRerank" 
          :un-checked-value="0" 
          :checked-value="1" 
        />
        <span class="ml-2 text-gray-400 text-xs">开启后将对检索结果进行精排，提升准确率</span>
      </FormItem>

      <FormItem v-if="formData.enableRerank" label="重排模型">
        <Select
          v-model:value="formData.rerankModel"
          :options="rerankModelOptions"
          placeholder="请选择重排模型"
          show-search
        />
      </FormItem>

      <FormItem label="备注" v-bind="validateInfos.remark">
        <Input.TextArea v-model:value="formData.remark" placeholder="请输入备注" :rows="2" />
      </FormItem>

      <FormItem label="描述" v-bind="validateInfos.description">
        <Input.TextArea v-model:value="formData.description" placeholder="请输入描述" :rows="3" />
      </FormItem>
    </Form>
  </BasicModal>
</template>
