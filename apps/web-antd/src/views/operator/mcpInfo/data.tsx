import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { renderDict } from '#/utils/render';
import { getDictOptions } from '#/utils/dict';

export const querySchema: FormSchemaGetter = () => [

  {
    component: 'Input',
    fieldName: 'serverName',
    label: '服务器名称',
  },

  {
    component: 'Select',
    fieldName: 'transportType',
    label: '链接方式',
  },

  {
    component: 'Input',
    fieldName: 'command',
    label: 'Command',
  },

  {
    component: 'RadioGroup',
    fieldName: 'status',
    label: '是否在线',
    componentProps: {
      options: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
    },
  },

];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },

  {
    title: '服务器名称',
    field: 'serverName',
  },

  {
    title: '链接方式',
    field: 'transportType',
    componentProps: {
        options: renderDict(DictEnum.MCP_TRANSPORT_TYPE),
      },
  },

  {
    title: 'Command',
    field: 'command',
  },

  {
    title: 'Args',
    field: 'arguments',
  },

  {
    title: 'Env',
    field: 'env',
  },
{
    title: '说明',
    field: 'description',
  },
  {
    title: '是否在线',
    field: 'status',

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
      fieldName: 'mcpId',
      visible: false,
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'serverName',
      component: 'Input',
      label: '服务器名称',
      formItemClass: 'col-span-1',
    },

    {
      fieldName: 'transportType',
      component: 'Select',
      label: '链接方式',
      formItemClass: 'col-span-1',
      componentProps: {
         options: getDictOptions(DictEnum.MCP_TRANSPORT_TYPE),
         style: { width: '100%' },
      },
    },

    {
      fieldName: 'command',
      component: 'Input',
      label: 'Command',
      formItemClass: 'col-span-2',
    },

    {
      fieldName: 'arguments',
      component: 'Textarea',
      label: 'Args',
      formItemClass: 'col-span-2',
    },

    {
      fieldName: 'env',
      component: 'Textarea',
      label: 'Env',
      formItemClass: 'col-span-2',
    },
    {
      fieldName: 'description',
      component: 'Textarea',
      label: '说明',
      formItemClass: 'col-span-2',
    },

    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: '是否启用',
       defaultValue: true,
      formItemClass: 'col-span-2',
      componentProps: {
        options: [
          { label: '是', value: true  },
          { label: '否', value: false },
        ],
      },
     },



];
