import type { FormSchemaGetter, VxeGridProps } from '#/adapter';

import { getPopupContainer } from '@vben/utils';

import { renderDictTag } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Select',
    componentProps: {
      placeholder: 'TODO: 字典类型',
      getPopupContainer,
    },
    fieldName: 'dictType',
    label: '字典类型',
  },
  {
    component: 'Input',
    fieldName: 'dictLabel',
    label: '字典标签',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },

  {
    title: '套餐名称',
    field: 'name',
  },
  {
    title: '套餐价格',
    field: 'price',
  },
  {
    title: '计划详情',
    field: 'planDetail',
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
    fieldName: 'dictCode',
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'dictType',
    label: '字典类型',
  },
  {
    component: 'Input',
    fieldName: 'listClass',
    label: '标签样式',
  },
  {
    component: 'Input',
    fieldName: 'dictLabel',
    label: '数据标签',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'dictValue',
    label: '数据键值',
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      placeholder: '可使用tailwind类名 如bg-blue w-full h-full等',
    },
    fieldName: 'cssClass',
    formItemClass: 'items-baseline',
    help: '标签的css样式, 可添加已经编译的css类名',
    label: 'css类名',
  },
  {
    component: 'InputNumber',
    fieldName: 'dictSort',
    label: '显示排序',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-baseline',
    label: '备注',
  },
];
