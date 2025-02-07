import type { FormSchemaGetter, VxeGridProps } from '#/adapter';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'fileName',
    label: '文件名',
  },
  {
    component: 'Input',
    fieldName: 'originalName',
    label: '原名',
  },
  {
    component: 'Input',
    fieldName: 'fileSuffix',
    label: '拓展名',
  },
  {
    component: 'Input',
    fieldName: 'service',
    label: '服务商',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '文件名',
    field: 'fileName',
    showOverflow: true,
  },
  {
    title: '文件原名',
    field: 'originalName',
    showOverflow: true,
  },
  {
    title: '文件拓展名',
    field: 'fileSuffix',
  },
  {
    title: '文件预览',
    field: 'url',
    showOverflow: true,
    slots: { default: 'url' },
  },
  {
    title: '创建时间',
    field: 'createTime',
    sortable: true,
  },
  {
    title: '上传人',
    field: 'createByName',
  },
  {
    title: '服务商',
    field: 'service',
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];
