import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { DictEnum } from '@vben/constants';

import { getDictOptions } from '#/utils/dict';

/**
 * 获取字典标签的映射函数
 */
function getDictLabel(value: number | string, dictName: string): string {
  if (!value) return '';
  const options = getDictOptions(dictName);
  const option = options.find(
    (item) => item.value === value || item.value === String(value),
  );
  return option?.label || String(value);
}

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'modelName',
    label: '模型名称',
  },
];

/**
 * 表格列配置
 * 如果需要使用 i18n 国际化，请使用 getter 函数形式，否则切换语言时列配置不会刷新
 * 使用方式: export const columns: () => VxeGridProps['columns'] = () => [...]
 */
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    title: '模型名称',
    field: 'modelName',
  },
  {
    title: '模型描述',
    field: 'modelDescribe',
  },
  {
    title: '模型供应商',
    field: 'providerCode',
  },
  {
    title: '模型价格',
    field: 'modelPrice',
  },
  {
    title: '优先级',
    field: 'priority',
  },
  {
    title: '模型分类',
    field: 'category',
    formatter: ({ row }) =>
      getDictLabel(row.category, DictEnum.CHAT_MODEL_CATEGORY),
  },
  {
    title: '计费类型',
    field: 'modelType',
    formatter: ({ row }) =>
      getDictLabel(row.modelType, DictEnum.SYS_MODEL_BILLING),
  },
  {
    title: '是否免费',
    field: 'modelFree',
    formatter: ({ row }) => getDictLabel(row.modelFree, DictEnum.SYS_YES_NO),
  },

  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];
