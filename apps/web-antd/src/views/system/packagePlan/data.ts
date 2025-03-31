import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '套餐名称',
  },
  {
    component: 'Input',
    fieldName: 'price',
    label: '套餐价格',
  },
  {
    component: 'Input',
    fieldName: 'duration',
    label: '有效时间',
  },
  {
    component: 'Textarea',
    fieldName: 'planDetail',
    label: '计划详情',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '主键',
    field: 'id',
  },
  {
    title: '套餐名称',
    field: 'name',
  },
  {
    title: '套餐价格',
    field: 'price',
  },
  {
    title: '有效时间',
    field: 'duration',
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
