<!--
使用 Ant Design Vue 原生 Form 组件生成表单
详细用法参考: https://antdv.com/components/form-cn
注意: 如果 VSCode 配置了自动移除未使用的导入，可能会误删某些组件导入
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';
import { computed, ref } from 'vue';

import { Input, InputNumber, Textarea, Select, Form, FormItem, RadioGroup } from 'ant-design-vue';
import { ImageUpload } from '#/components/upload';
import { pick } from 'lodash-es';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { providerAdd, providerInfo, providerUpdate } from '#/api/chat/provider';
import { ossInfo } from '#/api/system/oss';
import type { ProviderForm } from '#/api/chat/provider/model';

import {
  arkProvider,
  getCustomProviderConfig,
  providerOptions,
  providerStatusOptions,
} from './options';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<ProviderForm> = {
  id: undefined,
  providerName: undefined,
  providerCode: undefined,
  providerIcon: undefined,
  providerDesc: undefined,
  apiHost: undefined,
  status: '0',
  sortOrder: 0,
  remark: undefined,
  updateIp: undefined,
};

/**
 * 表单数据ref
 */
const formData = ref(cloneDeep(defaultValues));

type AntdFormRules<T> = Partial<Record<keyof T, RuleObject[]>> & {
  [key: string]: RuleObject[];
};
/**
 * 表单校验规则
 */
const formRules = ref<AntdFormRules<ProviderForm>>({
  providerName: [{ required: true, message: '厂商名称不能为空' }],
  providerCode: [{ required: true, message: '厂商编码不能为空' }],
  status: [{ required: true, message: '请选择厂商状态' }],
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
      const record = await providerInfo(id);
      // 只赋值存在的字段
      const filterRecord = pick(record, Object.keys(defaultValues));

      // 如果providerIcon是URL格式，直接保留
      if (
        filterRecord.providerIcon
        && typeof filterRecord.providerIcon === 'string'
        && filterRecord.providerIcon.startsWith('http')
      ) {
        filterRecord.providerIcon = filterRecord.providerIcon;
      }

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
    if (data.providerCode === arkProvider.value && !data.apiHost?.trim()) {
      data.apiHost = arkProvider.apiHost;
    }

    // 如果providerIcon是ossId，需要转换为URL
    if (data.providerIcon && typeof data.providerIcon === 'string') {
      // 检查是否是ossId（不包含http/https的字符串被认为是ossId）
      if (!data.providerIcon.startsWith('http')) {
        try {
          const ossFileList = await ossInfo(data.providerIcon);
          if (ossFileList && ossFileList.length > 0) {
            data.providerIcon = ossFileList[0].url;
          }
        } catch {
          // 失败时保持原值
        }
      }
    }

    await (isUpdate.value ? providerUpdate(data) : providerAdd(data));
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
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="厂商名称" v-bind="validateInfos.providerName">
        <Input v-model:value="formData.providerName" :placeholder="$t('ui.formRules.required')" />
      </FormItem>
      <FormItem
        label="厂商编码"
        v-bind="validateInfos.providerCode"
        :extra="getCustomProviderConfig(formData.providerCode) ? '选择服务商支持的接口协议，模型的请求地址在模型管理中单独填写。' : undefined"
      >
        <Select
          v-model:value="formData.providerCode"
          :options="providerOptions"
          :placeholder="$t('ui.formRules.required')"
          allow-clear
          show-search
        />
      </FormItem>
      <FormItem label="厂商图标" v-bind="validateInfos.providerIcon">
        <ImageUpload
          v-model:value="formData.providerIcon"
          :max-count="1"
          help-message
          keep-missing-id
        />
      </FormItem>
      <FormItem label="厂商描述" v-bind="validateInfos.providerDesc">
        <Textarea
          v-model:value="formData.providerDesc"
          :placeholder="$t('ui.formRules.required')"
          :rows="4"
        />
      </FormItem>
      <FormItem label="API地址" v-bind="validateInfos.apiHost">
        <Input
          v-model:value="formData.apiHost"
          :placeholder="formData.providerCode === arkProvider.value ? arkProvider.apiHost : $t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="排序" v-bind="validateInfos.sortOrder">
        <InputNumber v-model:value="formData.sortOrder" :min="0" :precision="0" />
      </FormItem>
      <FormItem label="状态" v-bind="validateInfos.status" extra="停用后，该厂商下的模型将无法用于新的调用。">
        <RadioGroup v-model:value="formData.status" :options="providerStatusOptions" />
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
