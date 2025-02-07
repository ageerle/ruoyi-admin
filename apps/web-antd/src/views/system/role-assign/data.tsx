import type { FormSchemaGetter } from '#/adapter';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'userName',
    label: '用户账号',
  },
  {
    component: 'Input',
    fieldName: 'phonenumber',
    label: '手机号码',
  },
];
