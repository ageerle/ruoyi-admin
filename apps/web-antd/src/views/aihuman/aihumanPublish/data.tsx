import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { AihumanPublishDict } from '#/api/aihuman/aihumanPublish/types';
import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';

export const querySchema: FormSchemaGetter = () => [
  // {
  //   component: 'Input',
  //   fieldName: 'name',
  //   label: '场景名称',
  // },
  // {
  //   component: 'Input',
  //   fieldName: 'modelName',
  //   label: '模型名称',
  // },
  // {
  //   component: 'RadioGroup',
  //   fieldName: 'status',
  //   label: '状态',
  //   componentProps: {
  //     options: getDictOptions(AihumanPublishDict.sys_normal_disable),
  //   },
  // },
];

export const columns: VxeGridProps['columns'] = [
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
        return renderDict(row.status, AihumanPublishDict.sys_normal_disable);
      },
    },
  },
];
