import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';
import { getDictOptions } from '#/utils/dict';

const accessPolicyOptions = [
  { color: 'orange', label: '私有', value: '0' },
  { color: 'green', label: '公开', value: '1' },
  { color: 'blue', label: '自定义', value: '2' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'configKey',
    label: '配置名称',
  },
  {
    component: 'Input',
    fieldName: 'bucketName',
    label: '桶名称',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: '是', value: '0' },
        { label: '否', value: '1' },
      ],
    },
    fieldName: 'status',
    label: '是否默认',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '配置名称',
    field: 'configKey',
  },
  {
    title: '访问站点',
    field: 'endpoint',
    showOverflow: true,
  },
  {
    title: '桶名称',
    field: 'bucketName',
  },
  {
    title: '域',
    field: 'region',
  },
  {
    title: '权限桶类型',
    field: 'accessPolicy',
    slots: {
      default: ({ row }) => {
        const current = accessPolicyOptions.find(
          (item) => item.value === row.accessPolicy,
        );
        if (current) {
          return <Tag color={current.color}>{current.label}</Tag>;
        }
        return '未知类型';
      },
    },
  },
  {
    title: '是否默认',
    field: 'status',
    slots: {
      default: 'status',
    },
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
    fieldName: 'ossConfigId',
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider1',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '基本信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'configKey',
    label: '配置名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'endpoint',
    label: '服务地址',
    renderComponentContent: (formModel) => ({
      addonBefore: () => (formModel.isHttps === 'Y' ? 'https://' : 'http://'),
    }),
    rules: z
      .string()
      .refine((domain) => domain && !/^https?:\/\/.*/.test(domain), {
        message: '请输入正确的域名, 不需要http(s)',
      }),
  },
  {
    component: 'Input',
    fieldName: 'domain',
    label: '自定义域名',
  },
  {
    component: 'Input',
    fieldName: 'tip',
    label: '占位作为提示使用',
    hideLabel: true,
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider2',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '认证信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'accessKey',
    label: 'accessKey',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'secretKey',
    label: 'secretKey',
    rules: 'required',
  },
  {
    component: 'Divider',
    componentProps: {
      orientation: 'center',
    },
    fieldName: 'divider3',
    hideLabel: true,
    renderComponentContent: () => ({
      default: () => '其他信息',
    }),
  },
  {
    component: 'Input',
    fieldName: 'bucketName',
    label: '桶名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'prefix',
    label: '前缀',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: accessPolicyOptions,
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'accessPolicy',
    formItemClass: 'col-span-6 lg:col-span-3',
    label: '权限桶类型',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_YES_NO),
      optionType: 'button',
    },
    defaultValue: 'N',
    fieldName: 'isHttps',
    formItemClass: 'col-span-6 lg:col-span-3',
    label: '是否https',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'region',
    label: '区域',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-start',
    label: '备注',
  },
];
