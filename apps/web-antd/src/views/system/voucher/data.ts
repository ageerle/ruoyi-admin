import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'code',
    label: '兑换码',
  },
  {
    component: 'Input',
    fieldName: 'amount',
    label: '兑换金额',
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: '用户id',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'status',
    label: '兑换状态',
  },
  {
    component: 'Input',
    fieldName: 'balanceBefore',
    label: '兑换前余额',
  },
  {
    component: 'Input',
    fieldName: 'balanceAfter',
    label: '兑换后余额',
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
    title: '兑换码',
    field: 'code',
  },
  {
    title: '兑换金额',
    field: 'amount',
  },
  {
    title: '用户id',
    field: 'userId',
  },
  {
    title: '兑换状态',
    field: 'status',
  },
  {
    title: '兑换前余额',
    field: 'balanceBefore',
  },
  {
    title: '兑换后余额',
    field: 'balanceAfter',
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
