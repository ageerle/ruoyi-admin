import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '分组名称',
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: '唯一编码',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '主键',
    field: 'id',
  },
  {
    title: '分组名称',
    field: 'name',
  },
  {
    title: '唯一编码',
    field: 'code',
  },
  {
    title: '图标',
    field: 'icon',
    width: 80,
  },
  {
    title: '排序',
    field: 'sort',
    width: 80,
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    title: '更新时间',
    field: 'updateTime',
    width: 180,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];