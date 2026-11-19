<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import type { InfoForm } from '#/api/knowledge/info/model';

import { ref, shallowRef, watch, h } from 'vue';
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
  Switch,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Tag,
  Slider
} from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { pick } from 'lodash-es';

import { infoAdd, infoInfo, infoUpdate } from '#/api/knowledge/info';
import { modelList } from '#/api/chat/model';

const props = defineProps<{
  knowledgeId?: string | number;
  refreshTrigger?: number;
}>();

const emit = defineEmits<{ saved: [id: string | number] }>();

const loading = ref(false);
const saving = shallowRef(false);
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
  enableRerank: 0,
  rerankModel: undefined,
  rerankScoreThreshold: 0,
  similarityThreshold: 0.5,
  remark: undefined,
};

const formData = ref<Partial<InfoForm>>({ ...defaultValues });
const loadedSplitConfig = ref('');

function splitConfigKey(value: Partial<InfoForm>) {
  return JSON.stringify([value.separator ?? '', value.textBlockSize, value.overlapChar]);
}

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
  { label: 'Qdrant', value: 'qdrant' },
];

const embeddingModelOptions = ref<Array<{ label: string; value: string }>>([]);
const rerankModelOptions = ref<Array<{ label: string; value: string }>>([]);

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

async function fetchRerankModels() {
  try {
    const response = await modelList({ category: 'rerank', pageSize: 1000 });
    const models = Array.isArray(response) ? response : (response.rows || response.records || []);
    rerankModelOptions.value = models.map((model: any) => ({
      label: model.modelDescribe || model.modelName,
      value: model.modelName,
    }));
  } catch (error) {
    console.error('Failed to fetch rerank models:', error);
  }
}

async function loadData() {
  loading.value = true;
  try {
    await Promise.all([fetchEmbeddingModels(), fetchRerankModels()]);

    isUpdate.value = !!props.knowledgeId;

    if (isUpdate.value && props.knowledgeId) {
      const record = await infoInfo(props.knowledgeId);
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = {
        ...filterRecord,
        rerankScoreThreshold: filterRecord.rerankScoreThreshold ?? 0,
      };
      loadedSplitConfig.value = splitConfigKey(filterRecord);
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
        similarityThreshold: 0.5,
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

watch(() => props.refreshTrigger, () => {
  loadData();
});

async function handleSubmit() {
  if (loading.value || saving.value) return;
  saving.value = true;
  try {
    await validate();
    const data = cloneDeep(formData.value);
    data.rerankScoreThreshold ??= 0;
    
    if (isUpdate.value) {
      const splitChanged = loadedSplitConfig.value !== splitConfigKey(data);
      await infoUpdate(data);
      loadedSplitConfig.value = splitConfigKey(data);
      if (splitChanged) {
        message.warning('分片配置已变更，现有文档不会自动重建，请在文档管理中点击“全部重新解析”。', 8);
      }
      emit('saved', data.id!);
    } else {
      const res = await infoAdd(data);
      const newId = (res as any)?.id || (res as any)?.data?.id || new Date().getTime();
      emit('saved', newId);
    }
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
}

// 预设刻度样式
const renderMark = (label: string) => h('span', { style: { fontSize: '10px', opacity: 0.7 } }, label);

const limitMarks = {
  3: renderMark('精简'),
  5: renderMark('默认'),
  10: renderMark('丰富'),
  20: renderMark('20')
};

const thresholdMarks = {
  0.2: renderMark('宽松'),
  0.5: renderMark('标准'),
  0.8: renderMark('严谨')
};
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
        <Input.TextArea
          v-model:value="formData.separator"
          :rows="2"
          placeholder="可输入换行或多字符；对 Markdown、代码等所有格式生效"
        />
      </FormItem>

      <FormItem label="文本块大小" v-bind="validateInfos.textBlockSize">
        <InputNumber v-model:value="formData.textBlockSize" :min="1" class="w-full" />
      </FormItem>

      <FormItem label="重叠字符数" v-bind="validateInfos.overlapChar">
        <InputNumber
          v-model:value="formData.overlapChar"
          :min="0"
          :max="Math.max(0, Number(formData.textBlockSize || 1) - 1)"
          class="w-full"
        />
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

      <FormItem>
        <template #label>
          <div class="flex items-center gap-1">
            <span>启用重排</span>
            <Tooltip placement="top">
              <template #title>
                在初步检索后的结果中，使用重排模型对待选文本块与原始问题进行二次相关性精打分。这能有效提升回答的准确度。
              </template>
              <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
        </template>
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

      <FormItem
        v-if="formData.enableRerank"
        label="重排分数阈值"
        extra="重排后，只保留分数达到该值的片段。"
      >
        <InputNumber v-model:value="formData.rerankScoreThreshold" :min="0" :max="1" :step="0.01" />
      </FormItem>

      <FormItem v-bind="validateInfos.retrieveLimit">
        <template #label>
          <div class="flex items-center gap-1">
            <span>检索条数</span>
            <Tooltip placement="top">
              <template #title>
                指定从知识库中检索并提供给大模型的最大文本块数量。建议配置在 3-10 条之间。
              </template>
              <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
        </template>
        <div class="flex items-center gap-4 pb-6">
          <Slider 
            v-model:value="formData.retrieveLimit" 
            :min="1" :max="20" 
            :marks="limitMarks"
            class="flex-1"
          />
          <InputNumber v-model:value="formData.retrieveLimit" :min="1" :max="20" size="small" class="text-xs w-16" />
        </div>
      </FormItem>

      <FormItem v-bind="validateInfos.similarityThreshold">
        <template #label>
          <div class="flex items-center gap-1">
            <span>向量相似度阈值</span>
            <Tooltip placement="top">
              <template #title>
                片段的向量相似度达到该值后，才会进入候选结果。
              </template>
              <QuestionCircleOutlined class="text-gray-400 text-xs cursor-help" />
            </Tooltip>
          </div>
        </template>
        <div class="flex items-center gap-4 pb-6">
          <Slider 
            v-model:value="formData.similarityThreshold" 
            :min="0" :max="1" :step="0.01" 
            :marks="thresholdMarks"
            class="flex-1"
          />
          <InputNumber v-model:value="formData.similarityThreshold" :min="0" :max="1" :step="0.01" size="small" class="text-xs w-16" />
        </div>
      </FormItem>

      <FormItem label="备注" v-bind="validateInfos.remark">
        <Input.TextArea
          v-model:value="formData.remark"
          :rows="2"
          placeholder="备注"
        />
      </FormItem>

      <FormItem :wrapper-col="{ offset: 4, span: 18 }">
        <Button type="primary" :loading="loading || saving" @click="handleSubmit">
          {{ isUpdate ? '保存更新' : '确认新增' }}
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
