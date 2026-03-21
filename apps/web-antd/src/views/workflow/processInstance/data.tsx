import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { OptionsTag } from '#/components/table';
import { renderDict } from '#/utils/render';

import { activityStatusOptions } from '../processDefinition/constant';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    label: '任务名称',
    fieldName: 'nodeName',
  },
  {
    component: 'Input',
    label: '流程名称',
    fieldName: 'flowName',
  },
  {
    component: 'Input',
    label: '流程编码',
    fieldName: 'flowCode',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'flowName',
    title: '流程名称',
    minWidth: 150,
  },
  {
    field: 'nodeName',
    title: '任务名称',
    minWidth: 150,
  },
  {
    field: 'flowCode',
    title: '流程编码',
    minWidth: 150,
  },
  {
    field: 'createByName',
    title: '申请人',
    minWidth: 150,
  },
  {
    field: 'version',
    title: '版本号',
    minWidth: 150,
    formatter: ({ cellValue }) => `V${cellValue}.0`,
  },
  {
    field: 'activityStatus',
    title: '状态',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        const cellValue = row.activityStatus;
        return (
          <OptionsTag
            options={activityStatusOptions as any}
            value={cellValue}
          />
        );
      },
    },
  },
  {
    field: 'flowStatus',
    title: '流程状态',
    minWidth: 100,
    slots: {
      default: ({ row }) => {
        return renderDict(row.flowStatus, DictEnum.WF_BUSINESS_STATUS);
      },
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];
