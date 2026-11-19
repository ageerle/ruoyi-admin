import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';

const statuses = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

export const querySchema: FormSchemaGetter = () => [
  { component: 'Input', fieldName: 'name', label: '技能标识' },
  {
    component: 'Select',
    componentProps: { options: statuses },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'name', minWidth: 160, title: '技能标识' },
  { field: 'description', minWidth: 260, title: '技能描述' },
  { field: 'status', slots: { default: 'status' }, title: '状态', width: 100 },
  { field: 'updateTime', title: '更新时间', width: 180 },
  { field: 'action', slots: { default: 'action' }, title: '操作', width: 144 },
];

export const skillFormSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: { show: () => false, triggerFields: [] },
    fieldName: 'id',
    label: 'ID',
  },
  {
    component: 'Input',
    componentProps: { maxlength: 64, placeholder: '例如 service-status' },
    dependencies: { disabled: (values) => Boolean(values.id), triggerFields: ['id'] },
    fieldName: 'name',
    help: '智能体通过技能标识关联技能，保存后请沿用原标识。',
    label: '技能标识',
    rules: z.string().min(1, '请输入技能标识').max(64).regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      '请使用小写字母、数字和分隔用的短横线',
    ),
  },
  {
    component: 'Textarea',
    componentProps: { maxlength: 1024, rows: 2 },
    fieldName: 'description',
    label: '技能描述',
    rules: z.string().trim().min(1, '请描述适合使用这项技能的场景').max(1024),
  },
  {
    component: 'Textarea',
    componentProps: {
      placeholder: '写下智能体启用这项技能后应遵循的步骤，可使用 Markdown',
      rows: 10,
    },
    fieldName: 'content',
    label: '技能指令',
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: { options: statuses },
    defaultValue: '0',
    fieldName: 'status',
    label: '状态',
  },
];
