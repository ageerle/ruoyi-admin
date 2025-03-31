import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '应用名称',
  },

  {
    component: 'Input',
    fieldName: 'authorName',
    label: '作者名称',
  },

  {
    component: 'Select',
    componentProps: {},
    fieldName: 'type',
    label: '类型',
  },
];

// 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
// export const columns: () => VxeGridProps['columns'] = () => [
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: 'id',
    field: 'id',
  },
  {
    title: 'gpts应用id',
    field: 'gid',
  },
  {
    title: 'gpts应用名称',
    field: 'name',
  },
  {
    title: 'gpts图标',
    field: 'logo',
  },
  {
    title: 'gpts描述',
    field: 'info',
  },
  // {
  //   title: '作者id',
  //   field: 'authorId',
  // },
  {
    title: '作者名称',
    field: 'authorName',
  },
  {
    title: '点赞',
    field: 'useCnt',
  },
  {
    title: '差评',
    field: 'bad',
  },

  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];
