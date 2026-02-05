import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'componentName',
    label: '组件名称',
  },
  {
    component: 'Input',
    fieldName: 'methodName',
    label: '方法名称',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '组件名称',
    field: 'componentName',
    formatter: ({ cellValue }) => cellValue ?? '-',
  },
  {
    title: '方法名称',
    field: 'methodName',
    formatter: ({ cellValue }) => cellValue ?? '-',
  },
  {
    title: '参数名称',
    field: 'methodParams',
  },
  {
    title: 'Spel表达式',
    field: 'viewSpel',
  },
  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_NORMAL_DISABLE);
      },
    },
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '创建时间',
    field: 'createTime',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 'auto',
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
    label: 'id',
  },
  {
    component: 'Input',
    fieldName: 'componentName',
    label: '组件名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'methodName',
    label: '方法名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'methodParams',
    label: '参数名称',
    // rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'viewSpel',
    label: 'Spel表达式',
    // rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    label: '状态',
    rules: 'required',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
