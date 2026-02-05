<!--
使用 Ant Design Vue 原生 Form 组件生成表单
详细用法参考: https://antdv.com/components/form-cn
注意: 如果 VSCode 配置了自动移除未使用的导入，可能会误删某些组件导入
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { ModelForm } from '#/api/chat/model/model';

import { computed, onMounted, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  Tag,
  Textarea,
} from 'ant-design-vue';
import { pick } from 'lodash-es';

import { modelAdd, modelInfo, modelUpdate } from '#/api/chat/model';
import { providerList } from '#/api/chat/provider';
import { getDictOptions } from '#/utils/dict';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const providerOptions = ref<Array<{ label: string; value: number | string }>>(
  [],
);
const providersMap = ref<Map<number | string, any>>(new Map());
const categoryOptions = computed(() =>
  getDictOptions(DictEnum.CHAT_MODEL_CATEGORY),
);
const billingTypeOptions = computed(() =>
  getDictOptions(DictEnum.SYS_MODEL_BILLING),
);
const yesNoOptions = computed(() => getDictOptions(DictEnum.SYS_YES_NO));
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

onMounted(async () => {
  loadProviders();
});

async function loadProviders() {
  try {
    const res = await providerList({ pageNum: 1, pageSize: 999 });
    providerOptions.value = res.rows.map((item) => ({
      label: item.providerName,
      value: item.providerCode,
    }));
    // 存储供应商完整信息，以便后续查询apiHost
    providersMap.value.clear();
    res.rows.forEach((item) => {
      providersMap.value.set(item.providerCode, item);
    });
  } catch (error) {
    console.error('Failed to load providers:', error);
  }
}

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<ModelForm> = {
  id: undefined,
  category: undefined,
  modelName: undefined,
  providerCode: undefined,
  modelDescribe: undefined,
  modelPrice: undefined,
  modelType: undefined,
  modelShow: undefined,
  modelFree: undefined,
  priority: undefined,
  apiHost: undefined,
  apiKey: undefined,
  remark: undefined,
};

/**
 * 表单数据ref
 */
const formData = ref(defaultValues);

/**
 * 监听供应商变化，自动填充apiHost
 */
watch(
  () => formData.value.providerCode,
  (newProviderCode) => {
    if (newProviderCode && providersMap.value.has(newProviderCode)) {
      const provider = providersMap.value.get(newProviderCode);
      formData.value.apiHost = provider.apiHost;
    }
  },
);

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<ModelForm>>({});

/**
 * useForm解构出表单方法
 */
const { validate, validateInfos, resetFields } = Form.useForm(
  formData,
  formRules,
);

const [BasicModal, modalApi] = useVbenModal({
  class: 'w-[800px]',
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
  formData.value = cloneDeep(defaultValues);
  resetFields();
}

/**
 * 获取分类颜色
 * @param category 分类值或颜色值
 * @param option 完整的选项对象，包含cssClass等信息
 */
function getCategoryColor(category: string, option?: any): string {
  // 优先使用option中的cssClass字段（可能包含自定义颜色）
  if (option?.cssClass) {
    const cssClass = option.cssClass.trim();
    // 如果是十六进制颜色或其他有效的CSS颜色值
    if (cssClass.startsWith('#') || isValidCSSColor(cssClass)) {
      return cssClass;
    }
  }

  // 其次查看category是否是有效的颜色值
  if (category.startsWith('#') || isValidCSSColor(category)) {
    return category;
  }

  // 最后使用预定义的颜色映射
  const colorMap: Record<string, string> = {
    chat: 'blue',
    embedding: 'green',
    image: 'orange',
    audio: 'purple',
    video: 'red',
    code: 'cyan',
    rerank: 'magenta',
  };
  return colorMap[category] || 'default';
}

/**
 * 判断是否为有效的CSS颜色值
 */
function isValidCSSColor(color: string): boolean {
  // 预定义的Ant Design颜色
  const antColors = [
    'red',
    'orange',
    'gold',
    'yellow',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
    'magenta',
    'volcano',
    'default',
  ];
  if (antColors.includes(color)) {
    return true;
  }

  // 简单检查是否为有效的十六进制颜色或rgb颜色
  const hexRegex = /^#([A-F0-9]{6}|[A-F0-9]{3}|[A-F0-9]{8})$/i;
  const rgbRegex = /^rgba?\(/;

  return hexRegex.test(color) || rgbRegex.test(color);
}
</script>

<template>
  <BasicModal :title="title" class="w-[700px]">
    <Form :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
      <Row :gutter="16">
        <Col :span="12">
          <FormItem label="供应商" v-bind="validateInfos.providerCode">
            <Select
              v-model:value="formData.providerCode"
              :placeholder="$t('ui.formRules.required')"
              :options="providerOptions"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="模型分类" v-bind="validateInfos.category">
            <Select
              v-model:value="formData.category"
              :placeholder="$t('ui.formRules.required')"
              :options="categoryOptions"
              show-search
              option-filter-prop="label"
            >
              <template #option="{ label, value, cssClass }">
                <div class="flex items-center justify-between">
                  <span>{{ label }}</span>
                  <Tag
                    :color="getCategoryColor(value, { cssClass })"
                    class="ml-2"
                  >
                    {{ value }}
                  </Tag>
                </div>
              </template>
              <template #tagRender="{ label, option }">
                <Tag :color="getCategoryColor(option.value, option)">
                  {{ label }}
                </Tag>
              </template>
            </Select>
          </FormItem>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <FormItem label="模型名称" v-bind="validateInfos.modelName">
            <Input
              v-model:value="formData.modelName"
              :placeholder="$t('ui.formRules.required')"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="模型描述" v-bind="validateInfos.modelDescribe">
            <Input
              v-model:value="formData.modelDescribe"
              :placeholder="$t('ui.formRules.required')"
            />
          </FormItem>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <FormItem label="计费类型" v-bind="validateInfos.modelType">
            <Select
              v-model:value="formData.modelType"
              :placeholder="$t('ui.formRules.required')"
              :options="billingTypeOptions"
              show-search
              option-filter-prop="label"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="是否免费" v-bind="validateInfos.modelFree">
            <Select
              v-model:value="formData.modelFree"
              :placeholder="$t('ui.formRules.required')"
              :options="yesNoOptions"
            />
          </FormItem>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="12">
          <FormItem
            label="模型价格 (Token计费是每1wToken的单价)"
            v-bind="validateInfos.modelPrice"
          >
            <Input
              v-model:value="formData.modelPrice"
              :placeholder="$t('ui.formRules.required')"
            />
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem
            label="优先级（值越大优先级越高）"
            v-bind="validateInfos.priority"
          >
            <Input
              v-model:value="formData.priority"
              :placeholder="$t('ui.formRules.required')"
            />
          </FormItem>
        </Col>
      </Row>

      <Row :gutter="16">
        <Col :span="24">
          <FormItem label="密钥" v-bind="validateInfos.apiKey">
            <Input
              v-model:value="formData.apiKey"
              :placeholder="$t('ui.formRules.required')"
            />
          </FormItem>
        </Col>
      </Row>

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

<style scoped>
:deep(.ant-form-item) {
  padding: 0 8px;
  margin-bottom: 20px;
}

:deep(.ant-form-item-label) {
  padding-bottom: 8px;
  text-align: left !important;
}

:deep(.ant-form-item-label > label) {
  justify-content: flex-start !important;
  font-weight: 500;
  color: rgb(0 0 0 / 85%);
  text-align: left !important;
}

:deep(.ant-form-item-control) {
  text-align: left !important;
}

:deep(.ant-form-item-control-input) {
  text-align: left !important;
}

:deep(.ant-input),
:deep(.ant-select),
:deep(.ant-picker),
:deep(.ant-textarea) {
  text-align: left !important;
}

:deep(.ant-input::placeholder),
:deep(.ant-textarea::placeholder) {
  color: rgb(0 0 0 / 45%);
}
</style>
