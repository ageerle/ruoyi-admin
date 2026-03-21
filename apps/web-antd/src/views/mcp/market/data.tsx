import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '市场名称',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: '启用', value: 'ENABLED' },
        { label: '禁用', value: 'DISABLED' },
      ],
    },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: 'ID',
    field: 'id',
    // width: 80,
    visible:false
  },
  {
    title: '市场名称',
    field: 'name',
    showOverflow: true,
    width: 200,
  },
  {
    title: '市场URL',
    field: 'url',
    showOverflow: true,
    width: 250,
  },
  {
    title: '市场描述',
    field: 'description',
    showOverflow: true,
    // width: 200,
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: {
      default: 'status',
    },
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 160,
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
    fieldName: 'name',
    label: '市场名称',
    rules: 'required',
    formItemClass: 'col-span-2',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 2,
    },
    fieldName: 'url',
    formItemClass: 'col-span-2',
    label: '市场URL',
    rules: 'required',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 3,
    },
    fieldName: 'description',
    formItemClass: 'col-span-2',
    label: '市场描述',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 6,
    },
    fieldName: 'authConfig',
    formItemClass: 'col-span-2',
    help: '认证配置（JSON格式），例如：{"type": "bearer", "token": "xxx"}',
    label: '认证配置',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '启用', value: 'ENABLED' },
        { label: '禁用', value: 'DISABLED' },
      ],
      optionType: 'button',
    },
    defaultValue: 'ENABLED',
    fieldName: 'status',
    label: '状态',
  },
];
