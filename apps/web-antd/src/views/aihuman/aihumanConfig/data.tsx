import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { AihumanConfigDict } from '#/api/aihuman/AihumanConfig/types';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [

  {
    component: 'Input',
    fieldName: 'name',
    label: '场景名称',
  },

  // {
  //   component: 'Input',
  //   fieldName: 'modelName',
  //   label: 'modelName',
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'modelPath',
  //   label: 'modelPath',
  // },

  // {
  //   component: 'Textarea',
  //   fieldName: 'modelParams',
  //   label: 'modelParams',
  // },

  // {
  //   component: 'Textarea',
  //   fieldName: 'agentParams',
  //   label: 'agentParams',
  // },

  // {
  //   component: 'DatePicker',
  //   fieldName: 'createTime',
  //   label: 'createTime',
  //   componentProps: {
  //     showTime: true,
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     valueFormat: 'YYYY-MM-DD HH:mm:ss',
  //   },
  // },

  // {
  //   component: 'DatePicker',
  //   fieldName: 'updateTime',
  //   label: 'updateTime',
  //   componentProps: {
  //     showTime: true,
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     valueFormat: 'YYYY-MM-DD HH:mm:ss',
  //   },
  // },

  // {
  //   component: 'RadioGroup',
  //   fieldName: 'status',
  //   label: 'status',
  //   componentProps: {
  //     options:  getDictOptions(AihumanConfigDict.sys_common_status),

  //   },
  // },

  {
    component: 'RadioGroup',
    fieldName: 'publish',
    label: '发布状态',
    componentProps: {
      options:  getDictOptions(AihumanConfigDict.aihuman_is_publish),

    },
  },

];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },

  {
    title: '场景名称',
    field: 'name',
  },

  {
    title: '模型名称',
    field: 'modelName',
  },

  {
    title: '模型路径',
    field: 'modelPath',
  },

  {
    title: '模型参数',
    field: 'modelParams',
  },

  {
    title: '智能体参数',
    field: 'agentParams',
  },

  {
    title: '创建时间',
    field: 'createTime',
  },

  {
    title: '修改时间',
    field: 'updateTime',
  },

  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.status,  AihumanConfigDict.sys_normal_disable);
      },
    },
  },

  {
    title: '发布状态',
    field: 'publish',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.publish,  AihumanConfigDict.aihuman_is_publish);
      },
    },
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
      fieldName: 'id',
      component: 'Input',
      label: 'id',
      disabled: true
    },
    {
      fieldName: 'name',
      component: 'Input',
      label: '场景名称',
    },
    {
      fieldName: 'modelName',
      component: 'Input',
      label: '模型名称',
    },
    {
      fieldName: 'modelPath',
      component: 'Input',
      label: '模型路径',
    },

    {
      fieldName: 'modelParams',
      component: 'Textarea',
      label: '模型参数',
    },
    {
      fieldName: 'agentParams',
      component: 'Textarea',
      label: '智能体参数',
    },
    {
      fieldName: 'createTime',
      component: 'DatePicker',
      label: '创建时间',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      fieldName: 'updateTime',
      component: 'DatePicker',
      label: '更新时间',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: '状态',
      rules: 'required',
      componentProps: {
         buttonStyle: 'solid',
        options:  getDictOptions(AihumanConfigDict.sys_normal_disable),
        optionType: 'button',
      },
      defaultValue: '0',

    },
    {
      fieldName: 'publish',
      component: 'RadioGroup',
      label: '发布状态',
      rules: 'required',
      componentProps: {
         buttonStyle: 'solid',
        options:  getDictOptions(AihumanConfigDict.aihuman_is_publish),
        optionType: 'button',
      },
      defaultValue: '0',
    },
];
