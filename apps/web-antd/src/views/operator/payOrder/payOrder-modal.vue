<!--
使用antd原生Form生成 详细用法参考ant-design-vue Form组件文档
vscode默认配置文件会自动格式化/移除未使用依赖
-->
<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import type { PayOrderForm } from '#/api/operator/payOrder/model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Form, FormItem, Input, RadioGroup, Textarea } from 'ant-design-vue';
import { pick } from 'lodash-es';

import {
  payOrderAdd,
  payOrderInfo,
  payOrderUpdate,
} from '#/api/operator/payOrder';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

/**
 * 定义默认值 用于reset
 */
const defaultValues: Partial<PayOrderForm> = {
  id: undefined,
  orderNo: undefined,
  orderName: undefined,
  amount: undefined,
  paymentStatus: undefined,
  paymentMethod: undefined,
  userId: undefined,
  remark: undefined,
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
const formRules = ref<AntdFormRules<PayOrderForm>>({
  orderNo: [{ required: true, message: '订单编号不能为空' }],
  orderName: [{ required: true, message: '订单名称不能为空' }],
  amount: [{ required: true, message: '金额不能为空' }],
  paymentStatus: [{ required: true, message: '支付状态不能为空' }],
  paymentMethod: [{ required: true, message: '支付方式不能为空' }],
  userId: [{ required: true, message: '用户ID不能为空' }],
  remark: [{ required: true, message: '备注不能为空' }],
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
      const record = await payOrderInfo(id);
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
    await (isUpdate.value ? payOrderUpdate(data) : payOrderAdd(data));
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
</script>

<template>
  <BasicModal :title="title">
    <Form :label-col="{ span: 4 }">
      <FormItem label="订单编号" v-bind="validateInfos.orderNo">
        <Input
          v-model:value="formData.orderNo"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="订单名称" v-bind="validateInfos.orderName">
        <Input
          v-model:value="formData.orderName"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="金额" v-bind="validateInfos.amount">
        <Input
          v-model:value="formData.amount"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="支付状态" v-bind="validateInfos.paymentStatus">
        <RadioGroup
          option-type="button"
          button-style="solid"
          v-model:value="formData.paymentStatus"
          :options="[]"
        />
      </FormItem>
      <FormItem label="支付方式" v-bind="validateInfos.paymentMethod">
        <Input
          v-model:value="formData.paymentMethod"
          :placeholder="$t('ui.formRules.required')"
        />
      </FormItem>
      <FormItem label="用户ID" v-bind="validateInfos.userId">
        <Input
          v-model:value="formData.userId"
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
