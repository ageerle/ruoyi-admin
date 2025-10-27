import { renderDict } from '#/utils/render';
import { AihumanRealConfigDict } from '#/api/aihuman/aihumanRealConfig/types';
import type { AihumanRealPublishInfo } from '#/api/aihuman/aihumanRealPublish/types';
import type { VXETableColumns } from '#/types/vxetable';

/**
 * 表格列配置
 */
export const columns: VXETableColumns<AihumanRealPublishInfo> = [
  {
    title: '配置ID',
    field: 'id',
    width: 80,
    align: 'center',
  },
  {
    title: '场景名称',
    field: 'name',
    minWidth: 180,
    search: {
      show: true,
      itemRender: 'Input',
    },
    slots: {
      default: ({ row }) => row.name || '',
    },
  },
  {
    title: '真人形象',
    field: 'avatars',
    width: 120,
    align: 'center',
    slots: {
      default: ({ row }) => row.avatars || '',
    },
  },
  {
    title: '模型名称',
    field: 'models',
    width: 120,
    align: 'center',
    slots: {
      default: ({ row }) => row.models || '',
    },
  },
  {
    title: '运行状态',
    field: 'runStatus',
    width: 100,
    align: 'center',
    slots: {
      default: ({ row }) => renderDict(row.runStatus!, AihumanRealConfigDict.aihuman_is_run),
    },
  },
  {
    title: '启动参数',
    field: 'runParams',
    minWidth: 200,
    slots: {
      default: ({ row }) => row.runParams || '',
    },
  },
  {
    title: '创建时间',
    field: 'createTime',
    width: 180,
    align: 'center',
    sortable: true,
    search: {
      show: true,
      itemRender: 'RangePicker',
    },
  },
  {
    title: '更新时间',
    field: 'updateTime',
    width: 180,
    align: 'center',
    sortable: true,
  },
];

export default columns;
