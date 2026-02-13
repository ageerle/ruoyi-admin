import type { VxeGridProps } from '#/adapter/vxe-table';
import { h } from 'vue';
import { Tag } from 'ant-design-vue';
export const columns: VxeGridProps['columns'] = [
    { type: 'checkbox', width: 60 },
    {
        title: '组件名称',
        field: 'name',
        minWidth: 180,
    },
    {
        title: '组件标题',
        field: 'title',
        minWidth: 180,
    },
    {
        title: '是否启用',
        field: 'isEnable',
        slots: {
            default: ({ row }) => {
                if (row.isEnable) {
                    return h(Tag, { color: 'green' }, () => '是');
                }
                return h(Tag, { color: 'default' }, () => '否');
            },
        },
    },
    {
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
        title: '操作',
        width: 320,
    },
];