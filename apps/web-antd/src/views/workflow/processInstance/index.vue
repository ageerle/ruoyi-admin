<script setup lang="ts">
import type { RadioChangeEvent } from 'ant-design-vue';

import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, RadioGroup, Space } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  deleteByInstanceIds,
  pageByFinish,
  pageByRunning,
} from '#/api/workflow/instance';
import CategoryTree from '#/views/workflow/processDefinition/category-tree.vue';

import { flowInfoModal } from '../components';
import { columns, querySchema } from './data';
import instanceInvalidModal from './instance-invalid-modal.vue';
import instanceVariableModal from './instance-variable-modal.vue';

// 左边分类用
const selectedCode = ref<number[] | string[]>([]);

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  handleReset: async () => {
    selectedCode.value = [];

    const { formApi, reload } = tableApi;
    await formApi.resetForm();
    const formValues = formApi.form.values;
    formApi.setLatestSubmissionValues(formValues);
    await reload(formValues);
  },
};

const typeOptions = [
  { label: '运行中', value: 'process_running' },
  { label: '已完成', value: 'process_completed' },
];
let currentTypeApi = pageByRunning;
const currentType = ref('process_running');
async function handleTypeChange(e: RadioChangeEvent) {
  const { value } = e.target;
  switch (value) {
    case 'process_completed': {
      currentTypeApi = pageByFinish;
      break;
    }
    case 'process_running': {
      currentTypeApi = pageByRunning;
      break;
    }
  }

  await tableApi.reload();
}

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
    // 点击行选中
    trigger: 'default',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        // 部门树选择处理
        if (selectedCode.value.length === 1) {
          formValues.category = selectedCode.value[0];
        } else {
          Reflect.deleteProperty(formValues, 'category');
        }

        return await currentTypeApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  headerCellConfig: {
    height: 44,
  },
  cellConfig: {
    height: 66,
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'workflow-definition-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [InstanceInvalidModal, instanceInvalidModalApi] = useVbenModal({
  connectedComponent: instanceInvalidModal,
});
async function handleInvalid(row: Recordable<any>) {
  instanceInvalidModalApi.setData({ id: row.id });
  instanceInvalidModalApi.open();
}

async function handleDelete(row: Recordable<any>) {
  await deleteByInstanceIds(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: any) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await deleteByInstanceIds(ids);
      await tableApi.query();
    },
  });
}
const [InstanceVariableModal, instanceVariableModalApi] = useVbenModal({
  connectedComponent: instanceVariableModal,
});
function handleVariable(row: Recordable<any>) {
  instanceVariableModalApi.setData({ instanceId: row.id });
  instanceVariableModalApi.open();
}

const [FlowInfoModal, flowInfoModalApi] = useVbenModal({
  connectedComponent: flowInfoModal,
});
function handleInfo(row: any) {
  console.log(row);
  flowInfoModalApi.setData({ businessId: row.businessId });
  flowInfoModalApi.open();
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <CategoryTree
        v-model:select-code="selectedCode"
        class="w-[260px]"
        @reload="() => tableApi.reload()"
        @select="() => tableApi.reload()"
      />
      <BasicTable class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <RadioGroup
            v-model:value="currentType"
            :options="typeOptions"
            button-style="solid"
            option-type="button"
            @change="handleTypeChange"
          />
        </template>
        <template #toolbar-tools>
          <Space>
            <a-button
              :disabled="!vxeCheckboxChecked(tableApi)"
              danger
              type="primary"
              v-access:code="['system:user:remove']"
              @click="handleMultiDelete"
            >
              {{ $t('pages.common.delete') }}
            </a-button>
          </Space>
        </template>
        <template #action="{ row }">
          <div class="flex flex-col">
            <div v-if="currentType === 'process_running'">
              <a-button
                danger
                size="small"
                type="link"
                @click.stop="handleInvalid(row)"
              >
                作废流程
              </a-button>
              <Popconfirm
                :get-popup-container="getVxePopupContainer"
                placement="left"
                title="确认删除？"
                @confirm="handleDelete(row)"
              >
                <a-button danger size="small" type="link" @click.stop="">
                  删除流程
                </a-button>
              </Popconfirm>
            </div>
            <div>
              <a-button size="small" type="link" @click.stop="handleInfo(row)">
                流程预览
              </a-button>
              <a-button
                size="small"
                type="link"
                @click.stop="handleVariable(row)"
              >
                变量查看
              </a-button>
            </div>
          </div>
        </template>
      </BasicTable>
    </div>
    <InstanceInvalidModal @reload="() => tableApi.reload()" />
    <InstanceVariableModal />
    <FlowInfoModal />
  </Page>
</template>
