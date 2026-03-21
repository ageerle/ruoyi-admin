import { optionsToEnum } from '@vben/utils';

export const activityStatusOptions = [
  {
    label: '激活',
    value: 1,
    color: 'success',
    enumName: 'Active',
  },
  {
    label: '挂起',
    value: 0,
    color: 'error',
    enumName: 'Suspended',
  },
] as const;

export const ActivityStatusEnum = optionsToEnum(activityStatusOptions);

export const publishStatusOptions = [
  {
    label: '已发布',
    value: 1,
    color: 'success',
  },
  {
    label: '未发布',
    value: 0,
    color: 'warning',
  },
  {
    label: '失效',
    value: 9,
    color: 'error',
  },
];
