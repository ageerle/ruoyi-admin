import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'orderNum',
    label: '排序号',
  },
  {
    component: 'Input',
    fieldName: 'testKey',
    label: 'key键',
  },
  {
    component: 'Input',
    fieldName: 'value',
    label: '值',
  },
  {
    component: 'Input',
    fieldName: 'version',
    label: '版本',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '主键',
    field: 'id',
  },
  {
    title: '排序号',
    field: 'orderNum',
  },
  {
    title: 'key键',
    field: 'testKey',
  },
  {
    title: '值',
    field: 'value',
  },
  {
    title: '版本',
    field: 'version',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    label: '主键',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '排序号',
    fieldName: 'orderNum',
    component: 'Input',
    rules: 'required',
  },
  {
    label: 'key键',
    fieldName: 'testKey',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '值',
    fieldName: 'value',
    component: 'Input',
    rules: 'required',
  },
  {
    label: '版本',
    fieldName: 'version',
    component: 'Input',
    rules: 'required',
  },
];
