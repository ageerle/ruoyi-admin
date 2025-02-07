import type { FormSchemaGetter, VxeGridProps } from '#/adapter';

import { DictEnum } from '@vben/constants';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'modelName',
    label: '模型名称',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '模型名称',
    field: 'modelName',
  },
  {
    title: '模型描述',
    field: 'modelDescribe',
  },
  {
    title: '模型价格',
    field: 'modelPrice',
  },

  {
    title: '请求地址',
    field: 'apiHost',
  },
  {
    title: '请求密钥',
    field: 'apiKey',
  },
  {
    title: '计费类型',
    field: 'modelType',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.modelType, DictEnum.SYS_MODEL_BILLING);
      },
    },
  },


  {
    title: '是否显示',
    field: 'modelShow',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.modelShow, DictEnum.SYS_SHOW_HIDE);
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },

  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: '模型主键',
  },
  {
    component: 'Input',
    fieldName: 'modelName',
    label: '模型名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'modelDescribe',
    label: '模型描述',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'modelPrice',
    label: '模型价格',
    rules: 'required',
  },

  {
    component: 'Input',
    fieldName: 'apiHost',
    label: '请求地址',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'apiKey',
    label: '请求密钥',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_SHOW_HIDE),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: 'modelShow',
    label: '是否显示',
    rules: 'required',
  },

  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_MODEL_BILLING),
      optionType: 'button',
    },
    defaultValue: '1',
    fieldName: 'modelType',
    label: '计费类型',
    rules: 'required',
  },



  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-baseline',
    label: '备注',
  },
];
