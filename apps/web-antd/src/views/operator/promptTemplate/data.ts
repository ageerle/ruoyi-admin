import type {FormSchemaGetter} from '#/adapter/form';
import type {VxeGridProps} from '#/adapter/vxe-table';

import {DictEnum} from '@vben/constants';

import {renderDict} from '#/utils/render';
import {getDictOptions} from "#/utils/dict";

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'templateName',
    label: '提示词模板名称',
  },
  {
    component: 'Input',
    fieldName: 'templateContent',
    label: '提示词模板内容',
  },
  {
    fieldName: 'category',
    label: '提示词分类',
    component: 'Select',
    componentProps: {
      showSearch: true,
      options: getDictOptions(DictEnum.PROMPT_TEMPLATE_TYPE),
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  {type: 'checkbox', width: 60},
  {
    title: '主键',
    field: 'id',
    visible: false,
  },
  {
    title: '提示词模板名称',
    field: 'templateName',
  },
  {
    title: '提示词模板内容',
    field: 'templateContent',
  },
  {
    title: '提示词分类',
    field: 'category',
    slots: {
      default: ({row}) => {
        return renderDict(row.category, DictEnum.PROMPT_TEMPLATE_TYPE);
      },
    },
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
  },
];
