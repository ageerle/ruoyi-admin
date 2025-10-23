import type { VbenFormSchema } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';
import { Tag } from 'ant-design-vue';

/**
 * 表格列配置
 */
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  { type: 'seq', width: 60, title: '序号', fixed: 'left' },
  {
    field: 'graphName',
    title: '图谱名称',
    minWidth: 150,
  },
  {
    field: 'knowledgeId',
    title: '关联知识库',
    minWidth: 120,
  },
  {
    field: 'modelName',
    title: 'LLM模型',
    minWidth: 120,
  },
  {
    field: 'graphStatus',
    title: '状态',
    width: 100,
    slots: { default: 'status' },
  },
  {
    field: 'nodeCount',
    title: '节点数',
    width: 100,
    align: 'right',
  },
  {
    field: 'relationshipCount',
    title: '边数',
    width: 100,
    align: 'right',
  },
  {
    field: 'createTime',
    title: '创建时间',
    minWidth: 160,
  },
  {
    field: 'action',
    title: '操作',
    width: 280,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

/**
 * 查询表单配置
 */
export function querySchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'instanceName',
      label: '图谱名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入图谱名称',
      },
    },
    {
      fieldName: 'knowledgeId',
      label: '知识库',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择知识库',
        api: async () => {
          // 这里需要调用知识库列表接口
          const { knowledgeList } = await import('#/api/operator/knowledgeBase');
          const res = await knowledgeList();
          return (res.rows || []).map((item: any) => ({
            label: item.kname,
            value: item.id,
          }));
        },
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '未构建', value: 'NOT_BUILT' },
          { label: '构建中', value: 'BUILDING' },
          { label: '已完成', value: 'COMPLETED' },
          { label: '失败', value: 'FAILED' },
        ],
      },
    },
  ];
}

/**
 * 将数字状态码转换为字符串状态
 */
export function getStatusString(graphStatus: number | undefined): string {
  const statusMap: Record<number, string> = {
    0: 'NOT_BUILT',
    10: 'BUILDING',
    20: 'COMPLETED',
    30: 'FAILED',
  };
  return statusMap[graphStatus || 0] || 'NOT_BUILT';
}

/**
 * 状态标签渲染
 * @param status 状态码（10=构建中, 20=已完成, 30=失败）或字符串状态
 */
export function renderStatusTag(status: number | string) {
  // 支持数字状态码（后端使用）
  const statusMap: Record<number | string, { color: string; text: string }> = {
    10: { color: 'processing', text: '构建中' },
    20: { color: 'success', text: '已完成' },
    30: { color: 'error', text: '失败' },
    0: { color: 'default', text: '未构建' },
    // 兼容字符串状态
    NOT_BUILT: { color: 'default', text: '未构建' },
    BUILDING: { color: 'processing', text: '构建中' },
    COMPLETED: { color: 'success', text: '已完成' },
    FAILED: { color: 'error', text: '失败' },
  };

  const config = statusMap[status] || { color: 'default', text: String(status) };
  return h(Tag, { color: config.color }, () => config.text);
}

/**
 * 表单Schema配置
 */
export function formSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      label: 'ID',
      component: 'Input',
      dependencies: {
        show: () => false,
        triggerFields: [''],
      },
    },
    {
      fieldName: 'instanceName',
      label: '图谱名称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入图谱名称',
      },
    },
    {
      fieldName: 'knowledgeId',
      label: '关联知识库',
      component: 'ApiSelect',
      rules: 'selectRequired',
      componentProps: {
        placeholder: '请选择知识库',
        api: async () => {
          const { knowledgeList } = await import('#/api/operator/knowledgeBase');
          const res = await knowledgeList();
          return (res.rows || []).map((item: any) => ({
            label: item.kname,
            value: item.id,
          }));
        },
      },
    },
    {
      fieldName: 'modelName',
      label: 'LLM模型',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择LLM模型（用于实体抽取）',
        api: async () => {
          const { modelList } = await import('#/api/operator/model');
          const res = await modelList({ pageNum: 1, pageSize: 100 });
          return (res.rows || []).map((item: any) => ({
            label: item.modelName,
            value: item.modelName,
          }));
        },
      },
    },
    {
      fieldName: 'entityTypes',
      label: '实体类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择实体类型（可多选）',
        mode: 'multiple',
        allowClear: true,
        options: [
          { label: '人物', value: 'PERSON' },
          { label: '组织', value: 'ORGANIZATION' },
          { label: '地点', value: 'LOCATION' },
          { label: '事件', value: 'EVENT' },
          { label: '概念', value: 'CONCEPT' },
          { label: '产品', value: 'PRODUCT' },
          { label: '技术', value: 'TECHNOLOGY' },
        ],
      },
    },
    {
      fieldName: 'relationTypes',
      label: '关系类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择关系类型（可多选）',
        mode: 'multiple',
        allowClear: true,
        options: [
          { label: '属于', value: 'BELONGS_TO' },
          { label: '包含', value: 'CONTAINS' },
          { label: '关联', value: 'RELATED_TO' },
          { label: '依赖', value: 'DEPENDS_ON' },
          { label: '影响', value: 'AFFECTS' },
          { label: '产生', value: 'PRODUCES' },
          { label: '使用', value: 'USES' },
        ],
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注信息',
        rows: 3,
      },
    },
  ];
}

