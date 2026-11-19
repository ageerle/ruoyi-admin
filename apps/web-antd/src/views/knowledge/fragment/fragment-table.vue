<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { FragmentVO } from '#/api/knowledge/fragment/model';

import { onMounted, shallowRef } from 'vue';

import { useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';
import { getVxePopupContainer } from '@vben/utils';

import { Button, message, Modal, Popconfirm } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  fragmentExport,
  fragmentList,
  fragmentRemove,
} from '#/api/knowledge/fragment';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import FragmentBatchDeleteButton from './fragment-batch-delete-button.vue';
import fragmentModal from './fragment-modal.vue';

const props = defineProps<{
  attachmentName: string;
  docId: string;
  knowledgeId: string;
}>();
const { hasAccessByCodes } = useAccess();
const viewedFragment = shallowRef<FragmentVO>();
const gridMounted = shallowRef(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 处理区间选择器 RangePicker 时间格式映射
  // 将一个时间区间字段映射为两个独立的开始/结束时间字段，用于搜索和导出
  // 示例: 将 createTime 字段映射为 params[beginTime] 和 params[endTime]
  // fieldMappingTime: [
  //   [
  //     'createTime', // 表单中的字段名
  //     ['params[beginTime]', 'params[endTime]'], // 映射后的字段名
  //     ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'], // 时间格式
  //   ],
  // ],
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    // trigger: 'row',
  },
  // 需要使用i18n注意这里要改成getter形式 否则切换语言不会刷新
  // columns: columns(),
  columns,
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const result = await fragmentList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
          docId: props.docId,
          knowledgeId: props.knowledgeId,
        });
        return {
          ...result,
          rows: result.rows.filter(
            (row) =>
              String(row.knowledgeId) === props.knowledgeId &&
              row.docId === props.docId,
          ),
        };
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  // 表格全局唯一标识，用于保存列配置
  id: 'system-fragment-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

onMounted(() => {
  gridMounted.value = true;
});

function hasSelectedFragments() {
  return vxeCheckboxChecked(tableApi);
}

const [FragmentModal, modalApi] = useVbenModal({
  connectedComponent: fragmentModal,
});

function openFragmentEditor(id?: FragmentVO['id']) {
  modalApi.setData({ ...props, id });
  modalApi.open();
}

async function copyFragment() {
  if (!viewedFragment.value) return;
  try {
    await navigator.clipboard.writeText(viewedFragment.value.content);
    message.success('已复制');
  } catch {
    message.error('复制失败，请手动复制。');
  }
}

async function handleDelete(row: FragmentVO) {
  await fragmentRemove(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: FragmentVO) => row.id);
  if (ids.length === 0) return;
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await fragmentRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  commonDownloadExcel(
    fragmentExport,
    '知识片段数据',
    {
      ...tableApi.formApi.form.values,
      docId: props.docId,
      knowledgeId: props.knowledgeId,
    },
    {
      fieldMappingTime: formOptions.fieldMappingTime,
    },
  );
}
</script>

<template>
  <div>
    <BasicTable>
      <template #toolbar-actions>
        <div class="fragment-list-actions">
          <Button
            type="primary"
            v-access:code="['system:fragment:add']"
            @click="openFragmentEditor()"
          >
            新增片段
          </Button>
          <Button
            v-access:code="['system:fragment:export']"
            @click="handleDownloadExcel"
          >
            {{ $t('pages.common.export') }}
          </Button>
          <FragmentBatchDeleteButton
            v-if="gridMounted"
            :has-selection="hasSelectedFragments"
            @remove="handleMultiDelete"
          />
        </div>
      </template>
      <template #action="{ row }">
        <div class="fragment-row-actions">
          <Button size="small" type="link" @click.stop="viewedFragment = row">
            查看
          </Button>
          <Button
            v-if="hasAccessByCodes(['system:fragment:query'])"
            v-access:code="['system:fragment:edit']"
            size="small"
            type="link"
            @click.stop="openFragmentEditor(row.id)"
          >
            {{ $t('pages.common.edit') }}
          </Button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <Button
              danger
              size="small"
              type="link"
              v-access:code="['system:fragment:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </Button>
          </Popconfirm>
        </div>
      </template>
    </BasicTable>
    <Modal
      :open="Boolean(viewedFragment)"
      :width="680"
      title="知识片段详情"
      @cancel="viewedFragment = undefined"
    >
      <template v-if="viewedFragment">
        <p class="text-muted-foreground mb-3 break-words text-sm">
          {{ attachmentName }}
        </p>
        <div class="fragment-preview">
          {{ viewedFragment.content }}
        </div>
      </template>
      <template #footer>
        <div class="fragment-preview-actions">
          <Button @click="copyFragment">复制片段</Button>
          <Button type="primary" @click="viewedFragment = undefined">
            关闭
          </Button>
        </div>
      </template>
    </Modal>
    <FragmentModal @reload="tableApi.query()" />
  </div>
</template>

<style scoped>
.fragment-list-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.fragment-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.fragment-preview {
  max-height: 60vh;
  padding: 12px 16px;
  overflow: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  line-height: 1.7;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.fragment-preview-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
</style>
