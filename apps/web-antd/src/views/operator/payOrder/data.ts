import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'orderNo',
    label: '订单编号',
  },
  {
    component: 'Input',
    fieldName: 'orderName',
    label: '订单名称',
  },
  {
    component: 'Input',
    fieldName: 'amount',
    label: '金额',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      optionType: 'button',
    },
    fieldName: 'paymentStatus',
    label: '支付状态',
  },
  {
    component: 'Input',
    fieldName: 'paymentMethod',
    label: '支付方式',
  },
  {
    component: 'Input',
    fieldName: 'userId',
    label: '用户ID',
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
    title: '订单编号',
    field: 'orderNo',
  },
  {
    title: '订单名称',
    field: 'orderName',
  },
  {
    title: '金额',
    field: 'amount',
  },
  {
    title: '支付状态',
    field: 'paymentStatus',
  },
  {
    title: '支付方式',
    field: 'paymentMethod',
  },
  {
    title: '用户ID',
    field: 'userId',
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
