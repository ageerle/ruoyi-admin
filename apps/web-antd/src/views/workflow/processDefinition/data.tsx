import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { OptionsTag } from '#/components/table';

import { publishStatusOptions } from './constant';

export const designerModeOptions = [
  {
    label: '经典模式',
    value: 'CLASSICS',
  },
  {
    label: '仿钉钉模式',
    value: 'MIMIC',
  },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'flowName',
    label: '流程名称',
  },
  {
    component: 'Input',
    fieldName: 'flowCode',
    label: '流程code',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'flowName',
    title: '流程名称',
    minWidth: 150,
  },
  {
    field: 'flowCode',
    title: '流程code',
    minWidth: 150,
  },
  // {
  //   field: 'modelValue',
  //   title: '设计器模式',
  //   minWidth: 150,
  // },
  {
    field: 'version',
    title: '版本号',
    minWidth: 80,
    formatter: ({ cellValue }) => `V${cellValue}.0`,
  },
  {
    field: 'activityStatus',
    title: '激活状态',
    minWidth: 100,
    slots: {
      default: 'activityStatus',
    },
  },
  {
    field: 'isPublish',
    title: '发布状态',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        const cellValue = row.isPublish;
        return (
          <OptionsTag options={publishStatusOptions as any} value={cellValue} />
        );
      },
    },
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

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
  },
  {
    component: 'TreeSelect',
    fieldName: 'category',
    label: '流程分类',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'flowCode',
    label: '流程code',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'flowName',
    label: '流程名称',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    fieldName: 'modelValue',
    label: '设计器模式',
    componentProps: {
      options: designerModeOptions,
      optionType: 'button',
      buttonStyle: 'solid',
    },
    defaultValue: 'CLASSICS',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'formPath',
    label: '表单路径',
    rules: 'required',
  },
];
