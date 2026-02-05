<script setup lang="tsx">
import { ref } from 'vue';

import { JsonPreview, useVbenModal } from '@vben/common-ui';
import { cn, getPopupContainer } from '@vben/utils';

import { message, Modal, Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { instanceVariable, updateFlowVariable } from '#/api/workflow/instance';

interface ModalData {
  /**
   * 变量 json字符串
   */
  record: string;
  instanceId: string;
}

const data = ref({});
const [BasicModal, modalApi] = useVbenModal({
  title: '流程变量',
  fullscreenButton: false,
  footer: false,
  onOpenChange: async (visible) => {
    if (!visible) {
      data.value = {};
      return null;
    }
    modalApi.modalLoading(true);

    await loadData();

    modalApi.modalLoading(false);
  },
});

const fieldTypeColors = {
  string: 'cyan',
  number: 'blue',
  boolean: 'orange',
  object: 'purple',
};
function getFieldTypeColor(fieldType: string) {
  return (
    fieldTypeColors[fieldType as keyof typeof fieldTypeColors] ?? 'default'
  );
}

async function loadData() {
  const { instanceId } = modalApi.getData() as ModalData;
  const resp = await instanceVariable(instanceId);
  const jsonObj = JSON.parse(resp.variable);
  data.value = jsonObj;

  // 表单
  const objEntry = Object.entries(jsonObj);

  interface OptionsType {
    label: string;
    value: string;
    fieldType: string;
  }

  formApi.updateSchema([
    {
      fieldName: 'key',
      componentProps: {
        options: objEntry.map(
          ([key, value]) =>
            ({
              label: key,
              value: key,
              fieldType: typeof value,
            }) as OptionsType,
        ),
      },
      renderComponentContent: () => ({
        option: (option: OptionsType) => (
          <div>
            {option.label}
            <Tag class="ml-1" color={getFieldTypeColor(option.fieldType)}>
              {option.fieldType}
            </Tag>
          </div>
        ),
      }),
    },
  ]);
}

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
      allowClear: true,
    },
    labelWidth: 80,
  },
  schema: [
    {
      fieldName: 'key',
      component: 'Select',
      label: '变量名称',
      rules: 'selectRequired',
      componentProps: {
        getPopupContainer,
      },
    },
    {
      fieldName: 'valueType',
      component: 'Select',
      label: '变量类型',
      rules: 'selectRequired',
      componentProps: {
        getPopupContainer,
        options: [
          {
            label: 'string',
            value: 'string',
          },
          {
            label: 'boolean | number | object (使用JSON.parse)',
            value: 'object',
          },
        ],
      },
    },
    {
      fieldName: 'value',
      component: 'Input',
      label: '变量值',
      rules: 'required',
    },
  ],
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    content: '修改',
  },
  handleSubmit: async (values) => {
    console.log(values);
    Modal.confirm({
      title: '修改流程变量',
      content: '确认修改流程变量吗？',
      centered: true,
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        await handleSubmit(values);
      },
    });
  },
});

async function handleSubmit(values: any) {
  try {
    modalApi.lock(true);

    const { instanceId } = modalApi.getData() as ModalData;

    let transformValue = values.value;
    if (values.valueType !== 'string') {
      try {
        transformValue = JSON.parse(values.value);
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          message.error(error.message);
        }
        throw error;
      }
    }

    // 修改
    const requestData = {
      instanceId,
      key: values.key,
      value: transformValue,
    };
    await updateFlowVariable(requestData);
    await formApi.resetForm();

    // 查询修改后的
    const resp = await instanceVariable(instanceId);
    const jsonObj = JSON.parse(resp.variable);
    data.value = jsonObj;
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}
</script>

<template>
  <BasicModal>
    <div
      :class="cn('min-h-[400px] overflow-y-auto border', 'rounded-[4px] p-2')"
    >
      <JsonPreview :data="data" />
    </div>
    <div class="mt-2 break-all text-sm font-medium text-orange-500">
      需要支持变量类型需要更改后端代码(原版只支持string类型)
      <div>
        ruoyi-modules/ruoyi-workflow/src/main/java/org/dromara/workflow/domain/bo/FlowVariableBo.java
      </div>
      将value的类型改为Object才能使用
    </div>
    <Form class="mt-2" />
  </BasicModal>
</template>
