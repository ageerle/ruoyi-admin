import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { formatDateTime } from '@vben/utils';

import { Tag } from 'ant-design-vue';

function renderStatus(status?: string, statusLabel?: string) {
  const statusText = statusLabel || status || '-';
  const statusKey = (status || '').toLowerCase();
  const colorMap: Record<string, string> = {
    error: 'error',
    fail: 'error',
    failed: 'error',
    running: 'processing',
    success: 'success',
    timeout: 'warning',
    cancelled: 'default',
  };
  const color = colorMap[statusKey] || 'default';

  return <Tag color={color}>{statusText}</Tag>;
}

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'traceId',
    label: 'Trace ID',
  },
  {
    component: 'Input',
    fieldName: 'traceName',
    label: 'Trace名称',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        { label: '全部', value: '' },
        { label: 'RAG 对话', value: 'RAG_CHAT' },
      ],
      placeholder: '全部',
    },
    fieldName: 'businessType',
    label: '业务类型',
  },
  {
    component: 'Input',
    fieldName: 'businessId',
    label: '业务ID',
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        { label: '全部', value: '' },
        { label: '成功', value: 'SUCCESS' },
        { label: '失败', value: 'ERROR' },
        { label: '运行中', value: 'RUNNING' },
        { label: '已取消', value: 'CANCELLED' },
      ],
      placeholder: '全部',
    },
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    fieldName: 'startTime',
    label: '开始时间',
  },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'traceName', minWidth: 140, title: 'Trace名称' },
  {
    field: 'traceId',
    minWidth: 220,
    title: 'Trace ID',
  },
  {
    field: 'businessTypeLabel',
    minWidth: 100,
    title: '业务类型',
    slots: {
      default: ({ row }) => {
        return row.businessTypeLabel || row.businessType || '-';
      },
    },
  },
  {
    field: 'businessId',
    minWidth: 120,
    title: '业务ID',
    slots: {
      default: ({ row }) => {
        return row.businessId || '-';
      },
    },
  },
  {
    field: 'status',
    minWidth: 90,
    title: '状态',
    slots: {
      default: ({ row }) => renderStatus(row.status, row.statusLabel),
    },
  },
  {
    field: 'durationMs',
    formatter({ cellValue }) {
      return cellValue === undefined || cellValue === null
        ? '-'
        : formatDuration(cellValue);
    },
    sortable: true,
    title: '耗时',
    width: 100,
  },
  {
    field: 'startTime',
    formatter({ cellValue }) {
      return cellValue === undefined || cellValue === null
        ? '-'
        : formatDateTime(cellValue);
    },
    sortable: true,
    title: '开始时间',
    width: 170,
  },
  {
    field: 'errorMessage',
    minWidth: 200,
    showOverflow: 'tooltip',
    title: '异常信息',
  },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 100,
  },
];

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  const m = Math.floor(ms / 60_000);
  const s = ((ms % 60_000) / 1000).toFixed(1);
  return `${m}m ${s}s`;
}
