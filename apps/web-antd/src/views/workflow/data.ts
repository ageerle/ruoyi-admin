import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';
import { Tag } from 'ant-design-vue';
import { getPopupContainer } from '@vben/utils';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'title',
    label: '工作流名称',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: [
        { label: '全部', value: '' },
        { label: '我的', value: 'my' },
        { label: '公开', value: 'public' },
      ],
    },
    fieldName: 'type',
    label: '类型',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '工作流名称',
    field: 'title',
    minWidth: 180,
  },
  {
    title: '备注',
    field: 'remark',
    minWidth: 200,
  },
  {
    title: '节点数量',
    field: 'nodeCount',
    width: 100,
    slots: {
      default: ({ row }) => {
        const count = Array.isArray(row.nodes) ? row.nodes.length : 0;
        return h('span', count.toString());
      },
    },
  },
  {
    title: '是否公开',
    field: 'isPublic',
    width: 100,
    slots: {
      default: ({ row }) => {
        if (row.isPublic) {
          return h(Tag, { color: 'green' }, () => '公开');
        }
        return h(Tag, { color: 'default' }, () => '私有');
      },
    },
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 180,
  },
  {
    title: '更新时间',
    field: 'updateTime',
    width: 180,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 320,
  },
];

