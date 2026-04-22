<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import type { InfoForm } from '#/api/knowledge/info/model';

import { computed, ref, watch } from 'vue';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Radio,
  RadioGroup,
  Button,
  Space,
  message,
  Switch,
  Slider,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { infoAdd, infoInfo, infoUpdate } from '#/api/knowledge/info';
import { embeddingModelList, rerankModelList } from '#/api/chat/model';

const emit = defineEmits<{ reload: [] }>();

const visible = ref(false);
const loading = ref(false);
const isUpdate = ref(false);

const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

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
  enableRerank: undefined,
  rerankModel: undefined,
  rerankTopN: undefined,
  rerankScoreThreshold: undefined,
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
  rerankModel: [{ required: true, message: '请选择重排序模型' }],
  rerankTopN: [{ required: true, message: '重排序返回数量不能为空' }],
  rerankScoreThreshold: [{ required: true, message: '分数阈值不能为空' }],
});

const vectorModelOptions = [
  { label: 'weaviate', value: 'weaviate' },
  { label: 'milvus', value: 'milvus' },
];

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
    const response = await embeddingModelList();
    const models = Array.isArray(response) ? response : (response.rows || response.records || []);
    embeddingModelOptions.value = models.map((model: any) => ({
      label: model.modelDescribe,
      value: model.modelName,
    }));
  } catch (error) {
    console.error('Failed to fetch embedding models:', error);
  }
}

async function fetchRerankModels() {
  try {
    const response = await rerankModelList();
    const models = Array.isArray(response) ? response : (response.rows || response.records || []);
    rerankModelOptions.value = models.map((model: any) => ({
      label: model.modelDescribe,
      value: model.modelName,
    }));
  } catch (error) {
    console.error('Failed to fetch rerank models:', error);
  }
}

// 监听检索条数变化，确保重排序返回数量不超过检索条数
watch(() => formData.value.retrieveLimit, (newVal) => {
  if (formData.value.rerankTopN && newVal && formData.value.rerankTopN > newVal) {
    formData.value.rerankTopN = newVal;
  }
});

// 监听启用重排序变化
watch(() => formData.value.enableRerank, (newVal) => {
  if (newVal === 1) {
    // 启用重排序时，设置默认值
    if (!formData.value.rerankModel && rerankModelOptions.value.length > 0) {
      formData.value.rerankModel = rerankModelOptions.value[0].value;
    }
    if (!formData.value.rerankTopN) {
      formData.value.rerankTopN = Math.min(5, formData.value.retrieveLimit || 5);
    }
    if (formData.value.rerankScoreThreshold === undefined) {
      formData.value.rerankScoreThreshold = 0.5;
    }
  }
});

async function handleOpen(id?: string | number) {
  loading.value = true;
  try {
    await Promise.all([fetchEmbeddingModels(), fetchRerankModels()]);

    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await infoInfo(id);
      const filterRecord = pick(record, Object.keys(defaultValues));
      formData.value = filterRecord;
    } else {
      const defaultEmbeddingModel = embeddingModelOptions.value.length > 0
        ? embeddingModelOptions.value[0].value
        : undefined;
      const defaultRerankModel = rerankModelOptions.value.length > 0
        ? rerankModelOptions.value[0].value
        : undefined;

      formData.value = {
        ...defaultValues,
        share: 0,
        vectorModel: 'weaviate',
        embeddingModel: defaultEmbeddingModel,
        retrieveLimit: 5,
        textBlockSize: 300,
        overlapChar: 30,
        enableRerank: 0,
        rerankModel: defaultRerankModel,
        rerankTopN: 5,
        rerankScoreThreshold: 0.5,
      };
    }

    visible.value = true;
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    loading.value = true;
    await validate();
    const data = cloneDeep(formData.value);
    await (isUpdate.value ? infoUpdate(data) : infoAdd(data));
    //message.success(isUpdate.value ? '修改成功' : '新增成功');
    emit('reload');
    handleClose();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  visible.value = false;
  formData.value = cloneDeep(defaultValues);
  resetFields();
}

defineExpose({
  open: handleOpen,
});
</script>

<template>
  <Drawer
    :title="title"
    :open="visible"
    @close="handleClose"
    :width="600"
    :body-style="{ paddingBottom: '80px' }"
  >
    <Form :model="formData" :label-col="{ span: 6 }">
      <FormItem label="知识名称" v-bind="validateInfos.name">
        <Input
          v-model:value="formData.name"
          :placeholder="$t('ui.formRules.required')"
        />
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
          :placeholder="$t('ui.formRules.required')"
          :rows="3"
        />
      </FormItem>
      <FormItem label="知识分隔符" v-bind="validateInfos.separator">
        <Input
          v-model:value="formData.separator"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="重叠字符" v-bind="validateInfos.overlapChar">
        <InputNumber
          v-model:value="formData.overlapChar"
          style="width: 100%"
          :placeholder="$t('ui.formRules.required')"
          :min="0"
        />
      </FormItem>
      <FormItem label="检索条数" v-bind="validateInfos.retrieveLimit">
        <InputNumber
          v-model:value="formData.retrieveLimit"
          style="width: 100%"
          :placeholder="$t('ui.formRules.required')"
          :min="1"
        />
      </FormItem>
      <FormItem label="文本块大小" v-bind="validateInfos.textBlockSize">
        <InputNumber
          v-model:value="formData.textBlockSize"
          style="width: 100%"
          :placeholder="$t('ui.formRules.required')"
          :min="1"
        />
      </FormItem>
      <FormItem label="向量库" v-bind="validateInfos.vectorModel">
        <Select
          v-model:value="formData.vectorModel"
          :options="vectorModelOptions"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="向量模型" v-bind="validateInfos.embeddingModel">
        <Select
          :key="`embedding-${embeddingModelOptions.length}`"
          v-model:value="formData.embeddingModel"
          :options="embeddingModelOptions"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="启用重排序">
        <Switch
          v-model:checked="formData.enableRerank"
          :checked-value="1"
          :un-checked-value="0"
        />
      </FormItem>
      <template v-if="formData.enableRerank === 1">
        <FormItem label="重排序模型" v-bind="validateInfos.rerankModel">
          <Select
            :key="`rerank-${rerankModelOptions.length}`"
            v-model:value="formData.rerankModel"
            :options="rerankModelOptions"
            :placeholder="$t('ui.formRules.required')"
          />
        </FormItem>
        <FormItem label="重排序数量" v-bind="validateInfos.rerankTopN">
          <InputNumber
            v-model:value="formData.rerankTopN"
            style="width: 100%"
            :placeholder="$t('ui.formRules.required')"
            :min="1"
            :max="formData.retrieveLimit || 100"
          />
          <div v-if="formData.retrieveLimit" class="text-gray-400 text-xs mt-1">
            不能超过检索条数 ({{ formData.retrieveLimit }})
          </div>
        </FormItem>
        <FormItem label="分数阈值" v-bind="validateInfos.rerankScoreThreshold">
          <div class="flex items-center gap-3">
            <Slider
              v-model:value="formData.rerankScoreThreshold"
              :min="0"
              :max="1"
              :step="0.01"
              style="flex: 1"
            />
            <span class="w-12 text-right">{{ (formData.rerankScoreThreshold || 0).toFixed(2) }}</span>
          </div>
        </FormItem>
      </template>
      <FormItem label="备注" v-bind="validateInfos.remark">
        <Input.TextArea
          v-model:value="formData.remark"
          :placeholder="$t('ui.formRules.required')"
          :rows="3"
        />
      </FormItem>
    </Form>

    <template #footer>
      <Space style="float: right">
        <Button @click="handleClose">取消</Button>
        <Button type="primary" :loading="loading" @click="handleSubmit">
          {{ isUpdate ? '更新' : '新增' }}
        </Button>
      </Space>
    </template>
  </Drawer>
</template>
