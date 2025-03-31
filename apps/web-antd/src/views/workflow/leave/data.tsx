import type { FormSchemaGetter, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import dayjs from 'dayjs';

import { OptionsTag } from '#/components/table';
import { renderDict } from '#/utils/render';

export const leaveTypeOptions = [
  { label: '病假', value: '1' },
  { label: '事假', value: '2' },
  { label: '年假', value: '3' },
  { label: '婚假', value: '4' },
  { label: '产假', value: '5' },
  { label: '其他', value: '7' },
];

export const leaveFlowOptions = [
  { label: '请假流程-普通', value: 'leave1' },
  { label: '请假流程-排他网关', value: 'leave2' },
  { label: '请假流程-并行网关', value: 'leave3' },
  { label: '请假流程-会签', value: 'leave4' },
  { label: '请假申请-并行会签网关', value: 'leave5' },
  { label: '请假申请-排他并行网关', value: 'leave6' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'InputNumber',
    componentProps: {
      min: 1,
    },
    fieldName: 'startLeaveDays',
    label: '请假天数',
  },
  {
    component: 'InputNumber',
    componentProps: {
      min: 1,
    },
    fieldName: 'endLeaveDays',
    label: '至',
    labelClass: 'justify-center',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '请假类型',
    field: 'leaveType',
    slots: {
      default: ({ row }) => {
        return <OptionsTag options={leaveTypeOptions} value={row.leaveType} />;
      },
    },
  },
  {
    title: '开始时间',
    field: 'startDate',
    formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD'),
  },
  {
    title: '结束时间',
    field: 'endDate',
    formatter: ({ cellValue }) => dayjs(cellValue).format('YYYY-MM-DD'),
  },
  {
    title: '请假天数',
    field: 'leaveDays',
    formatter: ({ cellValue }) => `${cellValue}天`,
  },
  {
    title: '请假原因',
    field: 'remark',
  },
  {
    title: '流程状态',
    field: 'status',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.WF_BUSINESS_STATUS);
      },
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 210,
  },
];

export const modalSchema: (isEdit: boolean) => VbenFormSchema[] = (
  isEdit: boolean,
) => [
  {
    label: '主键',
    fieldName: 'id',
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
  },
  {
    label: '流程类型',
    fieldName: 'flowType',
    component: 'Select',
    help: '这里仅仅为了发起流程方便, 实际不应该包含此字段',
    componentProps: {
      options: leaveFlowOptions,
      getPopupContainer,
    },
    defaultValue: 'leave1',
    rules: 'selectRequired',
    dependencies: {
      show: () => isEdit,
      triggerFields: [''],
    },
  },
  {
    label: '请假类型',
    fieldName: 'leaveType',
    component: 'Select',
    componentProps: {
      options: leaveTypeOptions,
      getPopupContainer,
    },
    rules: 'selectRequired',
    formItemClass: 'col-span-1',
  },
  {
    label: '开始时间',
    fieldName: 'dateRange',
    component: 'RangePicker',
    componentProps(model) {
      return {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        onChange: (dates: [string, string]) => {
          if (!dates) {
            model.leaveDays = null;
            return;
          }
          const [start, end] = dates;
          const leaveDays = dayjs(end).diff(dayjs(start), 'day') + 1;
          model.leaveDays = leaveDays;
        },
      };
    },
    rules: 'required',
    formItemClass: 'col-span-1',
  },
  {
    label: '请假天数',
    fieldName: 'leaveDays',
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    rules: 'required',
  },
  {
    label: '请假原因',
    fieldName: 'remark',
    component: 'Textarea',
    formItemClass: 'items-start',
  },
];
