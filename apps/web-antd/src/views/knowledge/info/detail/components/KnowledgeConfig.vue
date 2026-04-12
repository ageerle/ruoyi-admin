<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import type { InfoForm } from '#/api/knowledge/info/model';

import { ref, watch } from 'vue';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Radio,
  RadioGroup,
  Button,
  message,
  Card,
  Row,
  Col
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { infoAdd, infoInfo, infoUpdate } from '#/api/knowledge/info';
import { modelList } from '#/api/chat/model';

const props = defineProps<{
  knowledgeId?: string | number;
}>();

const emit = defineEmits<{ saved: [id: string | number] }>();

const loading = ref(false);
const isUpdate = ref(false);

const defaultValues: Partial<InfoForm> = {
  id: undefined,
  name: undefined,
  share: undefined,
  description: undefined,
  separator: undefined,
  overlapChar: undefined,
  retrieveLimit: undefined,
  textBlockSize: undefined,
  vectorModel: undefined,
  embeddingModel: undefined,
  remark: undefined,
};

const formData = ref<Partial<InfoForm>>({ ...defaultValues });

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};

const formRules = ref<AntdFormRules<InfoForm>>({
  name: [{ required: true, message: '知识库名称不能为空' }],
  share: [{ required: true, message: '请选择是否公开' }],
  vectorModel: [{ required: true, message: '请选择向量库' }],
  embeddingModel: [{ required: true, message: '请选择向量模型' }],
  retrieveLimit: [{ required: true, message: '知识库检索条数不能为空' }],
  textBlockSize: [{ required: true, message: '文本块大小不能为空' }],
  overlapChar: [{ required: true, message: '重叠字符数不能为空' }],
});

const vectorModelOptions = [
  { label: 'Weaviate', value: 'weaviate' },
  { label: 'Milvus', value: 'milvus' },
];

const embeddingModelOptions = ref<Array<{ label: string; value: string }>>([]);

const shareOptions = [
  { label: '是', value: 1 },
  { label: '否', value: 0 },
];

const { validate, validateInfos } = Form.useForm(
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
  } catch (error) {
    console.error('Failed to fetch embedding models:', error);
  }
}

async function loadData() {
  loading.value = true;
  try {
    await fetchEmbeddingModels();

    isUpdate.value = !!props.knowledgeId;

    if (isUpdate.value && props.knowledgeId) {
      const record = await infoInfo(props.knowledgeId);
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = filterRecord;
    } else {
      const defaultEmbeddingModel = embeddingModelOptions.value.length > 0
        ? embeddingModelOptions.value[0].value
        : undefined;

      formData.value = {
        ...defaultValues,
        share: 0,
        vectorModel: 'weaviate',
        embeddingModel: defaultEmbeddingModel,
        retrieveLimit: 5,
        textBlockSize: 300,
        overlapChar: 30,
      };
    }
  } finally {
    loading.value = false;
  }
}

watch(() => props.knowledgeId, () => {
  loadData();
}, { immediate: true });

async function handleSubmit() {
  try {
    loading.value = true;
    await validate();
    const data = cloneDeep(formData.value);
    
    if (isUpdate.value) {
      await infoUpdate(data);
      message.success('更新成功');
      emit('saved', data.id!);
    } else {
      const res = await infoAdd(data);
      message.success('新增成功');
      const newId = (res as any)?.id || (res as any)?.data?.id || new Date().getTime();
      emit('saved', newId);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="px-4 py-8 max-w-4xl">
    <Form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <FormItem label="知识名称" v-bind="validateInfos.name">
        <Input v-model:value="formData.name" placeholder="请输入知识库名称" />
      </FormItem>

      <FormItem label="是否公开" v-bind="validateInfos.share">
        <RadioGroup v-model:value="formData.share">
          <Radio v-for="option in shareOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Radio>
        </RadioGroup>
      </FormItem>

      <FormItem label="知识库描述" v-bind="validateInfos.description">
        <Input.TextArea
          v-model:value="formData.description"
          :rows="3"
          placeholder="请输入知识库描述"
        />
      </FormItem>

      <FormItem label="知识分隔符" v-bind="validateInfos.separator">
        <Input v-model:value="formData.separator" placeholder="知识分隔符" />
      </FormItem>

      <FormItem label="文本块大小" v-bind="validateInfos.textBlockSize">
        <InputNumber v-model:value="formData.textBlockSize" :min="1" class="w-full" />
      </FormItem>

      <FormItem label="重叠字符数" v-bind="validateInfos.overlapChar">
        <InputNumber v-model:value="formData.overlapChar" :min="0" class="w-full" />
      </FormItem>

      <FormItem label="向量库" v-bind="validateInfos.vectorModel">
        <Select
          v-model:value="formData.vectorModel"
          :options="vectorModelOptions"
        />
      </FormItem>

      <FormItem label="向量模型" v-bind="validateInfos.embeddingModel">
        <Select
          :key="`embedding-${embeddingModelOptions.length}`"
          v-model:value="formData.embeddingModel"
          :options="embeddingModelOptions"
          placeholder="请选择向量模型"
        />
      </FormItem>

      <FormItem label="检索条数" v-bind="validateInfos.retrieveLimit">
        <InputNumber v-model:value="formData.retrieveLimit" :min="1" class="w-full" />
      </FormItem>

      <FormItem label="备注" v-bind="validateInfos.remark">
        <Input.TextArea
          v-model:value="formData.remark"
          :rows="2"
          placeholder="备注"
        />
      </FormItem>

      <FormItem :wrapper-col="{ offset: 4, span: 18 }">
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ isUpdate ? '保存更新' : '确认新增' }}
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
