import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { AihumanRealConfigDict } from '#/api/aihuman/AihumanRealConfig/types';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [

  { // 操作列 - 包含启动、停止、编辑和删除操作 // 运行状态列 - 使用字典数据进行渲染
    component: 'Input',
    fieldName: 'name',
    label: '场景名称',
  },

  // {
  //   component: 'Input',
  //   fieldName: 'avatars',
  //   label: '真人形象名称',
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'models',
  //   label: '模型名称',
  // },

  // {
  //   component: 'Textarea',
  //   fieldName: 'avatarsParams',
  //   label: '形象参数（预留）',
  // },

  // {
  //   component: 'Textarea',
  //   fieldName: 'modelsParams',
  //   label: '模型参数（预留）',
  // },

  // {
  //   component: 'Textarea',
  //   fieldName: 'agentParams',
  //   label: '智能体参数（扣子）',
  // },

  // {
  //   component: 'DatePicker',
  //   fieldName: 'createTime',
  //   label: '创建时间',
  //   componentProps: {
  //     showTime: true,
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     valueFormat: 'YYYY-MM-DD HH:mm:ss',
  //   },
  // },

  // {
  //   component: 'DatePicker',
  //   fieldName: 'updateTime',
  //   label: '更新时间',
  //   componentProps: {
  //     showTime: true,
  //     format: 'YYYY-MM-DD HH:mm:ss',
  //     valueFormat: 'YYYY-MM-DD HH:mm:ss',
  //   },
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'status',
  //   label: '状态',
  //   componentProps: {
  //     options: getDictOptions(AihumanRealConfigDict.sys_normal_disable),

  //   },
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'publish',
  //   label: '发布状态',
  //   componentProps: {
  //     options:  getDictOptions(AihumanRealConfigDict.aihuman_is_publish),

  //   },
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'createDept',
  //   label: '创建部门',
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'createBy',
  //   label: '创建用户',
  // },

  // {
  //   component: 'Input',
  //   fieldName: 'updateBy',
  //   label: '更新用户',
  // },

];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },

  {
    title: '场景名称',
    field: 'name',
  },

  {
    title: '真人形象名称',
    field: 'avatars',
  },

  {
    title: '模型名称',
    field: 'models',
  },

  // {
  //   title: '形象参数（预留）',
  //   field: 'avatarsParams',
  // },

  // {
  //   title: '模型参数（预留）',
  //   field: 'modelsParams',
  // },

  {
    title: '智能体参数',
    field: 'agentParams',
  },
  {
    title: '启动参数',
    field: 'runParams',
  },

  {
    title: '创建时间',
    field: 'createTime',
  },

  {
    title: '更新时间',
    field: 'updateTime',
  },

  {
    title: '状态',
    field: 'status',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, AihumanRealConfigDict.sys_normal_disable);
      },
    },
  },

  {
    title: '发布状态',
    field: 'publish',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.publish, AihumanRealConfigDict.aihuman_is_publish);
      },
    },
  },
  {
    title: '运行状态',
    field: 'runStatus',
    width: 120,
    slots: {
      default: ({ row }) => {
        return renderDict(row.runStatus, AihumanRealConfigDict.aihuman_is_run);
      },
    },
  },

  // {
  //   title: '创建部门',
  //   field: 'createDept',
  // },

  // {
  //   title: '创建用户',
  //   field: 'createBy',
  // },

  // {
  //   title: '更新用户',
  //   field: 'updateBy',
  // },

  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 280,
  },
];

export const modalSchema: FormSchemaGetter = (formProps = {}) => {
  const { isUpdate = false } = formProps as { isUpdate?: boolean } || {};

  return [
    {
      fieldName: 'id',
      component: 'InputNumber',
      label: 'ID',
      show: !!isUpdate,
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'name',
      component: 'Input',
      label: '场景名称',
      rules: 'required',
    },
    {
      fieldName: 'avatars',
      component: 'Input',
      label: '真人形象名称',
      rules: 'required',
    },
    {
      fieldName: 'models',
      component: 'Input',
      label: '模型名称',
      rules: 'required',
    },
    // {
    //   fieldName: 'avatarsParams',
    //   component: 'Textarea',
    //   label: '形象参数（预留）',
    //   show: false,
    // },
    // {
    //   fieldName: 'modelsParams',
    //   component: 'Textarea',
    //   label: '模型参数（预留）',
    //   show: false,
    // },
    {
      fieldName: 'agentParams',
      component: 'Textarea',
      label: '智能体参数',
      componentProps: {
        style: { height: '200px' },
      },
    },
    {
      fieldName: 'runParams',
      component: 'Textarea',
      label: '启动参数',
      componentProps: {
        style: { height: '200px' },
      },
    },
    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: '状态',
      rules: 'required',
      componentProps: {
        buttonStyle: 'solid',
        options: getDictOptions(AihumanRealConfigDict.sys_normal_disable),
        optionType: 'button',
      },
      defaultValue: 0, // 改为数值类型
    },
    {
      fieldName: 'publish',
      component: 'RadioGroup',
      label: '发布状态',
      rules: 'required',
      componentProps: {
        buttonStyle: 'solid',
        options: getDictOptions(AihumanRealConfigDict.aihuman_is_publish),
        optionType: 'button',
      },
      defaultValue: 0, // 改为数值类型
    },
    // {
    //   fieldName: 'createDept',
    //   component: 'Input',
    //   label: '创建部门',
    //   show: false,
    // },

    // {
    //   fieldName: 'createBy',
    //   component: 'Input',
    //   label: '创建用户',
    //   show: false,
    // },

    // {
    //   fieldName: 'updateBy',
    //   component: 'Input',
    //   label: '更新用户',
    //   show: false,
    // }
  ]
}
