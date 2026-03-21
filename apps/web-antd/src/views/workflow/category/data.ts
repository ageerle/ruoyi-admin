import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    fieldName: 'categoryName',
    label: '分类名称',
    component: 'Input',
  },
  {
    fieldName: 'categoryCode',
    label: '分类编码',
    component: 'Input',
  },
];

export const columns: VxeGridProps['columns'] = [
  {
    field: 'categoryName',
    title: '分类名称',
    treeNode: true,
  },
  {
    field: 'orderNum',
    title: '排序',
  },
  {
    field: 'createTime',
    title: '创建时间',
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
    label: 'categoryId',
    fieldName: 'categoryId',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    fieldName: 'parentId',
    label: '父级分类',
    rules: 'required',
    defaultValue: 100,
    component: 'TreeSelect',
  },
  {
    fieldName: 'categoryName',
    label: '分类名称',
    component: 'Input',
    rules: 'required',
  },
  {
    fieldName: 'orderNum',
    label: '排序',
    component: 'InputNumber',
  },
];
