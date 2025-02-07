import { DictEnum } from '@vben/constants';
import { getPopupContainer } from '@vben/utils';

import { type FormSchemaGetter, type VxeGridProps, z } from '#/adapter';
import { getDictOptions } from '#/utils/dict';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userName',
    label: '用户账号',
  },
  {
    component: 'Input',
    fieldName: 'nickName',
    label: '用户昵称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
    },
    fieldName: 'status',
    label: '用户状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '创建时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'userName',
    title: '用户名称',
  },
  {
    field: 'userBalance',
    title: '用户余额',
  },
  {
    field: 'avatar',
    title: '头像',
    slots: { default: 'avatar' },
    width: 80,
  },
  {
    field: 'createTime',
    title: '创建时间',
  },
  {
    field: 'loginDate',
    title: '最后登录时间',
  },
  {
    field: 'status',
    title: '状态',
    slots: { default: 'status' },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

export const drawerSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show: () => false,
      triggerFields: [''],
    },
    fieldName: 'userId',
  },
  {
    component: 'Input',
    fieldName: 'userName',
    label: '用户账号',
    rules: 'required',
  },
  {
    component: 'InputPassword',
    fieldName: 'password',
    label: '用户密码',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'nickName',
    label: '用户昵称',
    rules: 'required',
  },
  {
    component: 'TreeSelect',
    // 在drawer里更新 这里不需要默认的componentProps
    defaultValue: undefined,
    fieldName: 'deptId',
    label: '所属部门',
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    fieldName: 'phone',
    label: '手机号码',
    defaultValue: undefined,
    rules: z
      .string()
      .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
      .optional(),
  },
  {
    component: 'Input',
    fieldName: 'email',
    defaultValue: undefined,
    label: '邮箱',
    // TODO: 这里非必填未生效
    rules: z.string().email('请输入正确的邮箱').optional(),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_USER_SEX),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'sex',
    formItemClass: 'col-span-2 lg:col-span-1',
    label: '性别',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: getDictOptions(DictEnum.SYS_NORMAL_DISABLE),
      optionType: 'button',
    },
    defaultValue: '0',
    fieldName: 'status',
    formItemClass: 'col-span-2 lg:col-span-1',
    label: '状态',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      optionFilterProp: 'label',
      optionLabelProp: 'label',
      placeholder: '请先选择部门',
    },
    fieldName: 'postIds',
    help: '选择部门后, 将自动加载该部门下所有的岗位',
    label: '岗位',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      optionFilterProp: 'label',
      optionLabelProp: 'label',
    },
    fieldName: 'roleIds',
    label: '角色',
  },
  {
    component: 'Textarea',
    fieldName: 'remark',
    formItemClass: 'items-baseline',
    label: '备注',
  },
];
