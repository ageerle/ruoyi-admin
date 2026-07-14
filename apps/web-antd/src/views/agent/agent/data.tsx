import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import {
  agentKnowledgeOptions,
  agentMcpToolOptions,
  agentModelOptions,
  agentSkillOptions,
} from '#/api/agent/agent';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'agentName',
    label: '智能体名称',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' },
      ],
    },
    fieldName: 'status',
    label: '状态',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: 'ID',
    field: 'id',
    visible: false,
  },
  {
    title: '智能体名称',
    field: 'agentName',
    showOverflow: true,
    width: 180,
  },
  {
    title: '描述',
    field: 'agentDescribe',
    showOverflow: true,
  },
  {
    title: '绑定模型',
    field: 'modelName',
    width: 160,
  },
  {
    title: '深度思考',
    field: 'enableThinking',
    width: 100,
    formatter({ cellValue }) {
      return cellValue === '1' ? '是' : '否';
    },
  },
  {
    title: '状态',
    field: 'status',
    width: 90,
    formatter({ cellValue }) {
      return cellValue === '1' ? '停用' : '正常';
    },
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 160,
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

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'id',
    label: 'id',
  },
  {
    component: 'Input',
    fieldName: 'agentName',
    label: '智能体名称',
    rules: 'required',
    formItemClass: 'col-span-2',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 2,
    },
    fieldName: 'agentDescribe',
    formItemClass: 'col-span-2',
    label: '智能体描述',
  },
  {
    component: 'Input',
    fieldName: 'agentShow',
    label: '展示图标',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: agentModelOptions,
      resultField: 'rows',
      labelField: 'modelDescribe',
      valueField: 'id',
      placeholder: '请选择聊天模型',
    },
    fieldName: 'modelId',
    label: '绑定模型',
    rules: 'selectRequired',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '否', value: '0' },
        { label: '是', value: '1' },
      ],
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'enableThinking',
    label: '深度思考',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: agentMcpToolOptions,
      resultField: 'data',
      labelField: 'name',
      valueField: 'id',
      mode: 'multiple',
      placeholder: '请选择关联的 MCP 工具',
    },
    fieldName: 'mcpToolIds',
    formItemClass: 'col-span-2',
    label: '关联工具',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: agentSkillOptions,
      labelField: 'description',
      valueField: 'name',
      mode: 'multiple',
      placeholder: '请选择关联的磁盘技能',
    },
    fieldName: 'skillNames',
    formItemClass: 'col-span-2',
    label: '关联技能',
  },
  {
    component: 'ApiSelect',
    componentProps: {
      api: agentKnowledgeOptions,
      resultField: 'rows',
      labelField: 'name',
      valueField: 'id',
      mode: 'multiple',
      placeholder: '请选择关联的知识库',
    },
    fieldName: 'knowledgeIds',
    formItemClass: 'col-span-2',
    label: '关联知识库',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 6,
    },
    fieldName: 'systemPrompt',
    formItemClass: 'col-span-2',
    label: '自定义提示词',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' },
      ],
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'Textarea',
    componentProps: {
      rows: 2,
    },
    fieldName: 'remark',
    formItemClass: 'col-span-2',
    label: '备注',
  },
];
