import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';

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
  {type: 'checkbox', width: 60},
  {
    title: '主键',
    field: 'id',
    visible: false
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
  },
  {
    title: '备注',
    field: 'remark',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: {default: 'action'},
    title: '操作',
    width: 180,
  },
];
