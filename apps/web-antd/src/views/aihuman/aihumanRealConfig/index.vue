<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AihumanRealConfigInfo } from '#/api/aihuman/aihumanRealConfig/types';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import {
  Dropdown,
  Menu,
  MenuItem,
  Modal,
  Popconfirm,
  Space,
} from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
// 明确导入所有需要的API函数，确保启动和停止接口可用
import {
  aihumanRealConfigExport,
  aihumanRealConfigList,
  aihumanRealConfigRemove,
  aihumanRealConfigRun,
  aihumanRealConfigStop
} from '#/api/aihuman/aihumanRealConfig';
import { commonDownloadExcel } from '#/utils/file/download';

import { columns, querySchema } from './data';
import aihumanRealConfigModal from './aihumanRealConfig-modal.vue';

defineOptions({
  name: 'AihumanAihumanRealConfig',
});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  schema: querySchema(),
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await aihumanRealConfigList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  id: 'aihuman-aihumanRealConfig-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [AihumanRealConfigModal, modalApi] = useVbenModal({
  connectedComponent: aihumanRealConfigModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

function handleEdit(row: AihumanRealConfigInfo) {
  modalApi.setData({ id: row.id });
  modalApi.open();
}

async function handleDelete(row: AihumanRealConfigInfo) {
  await aihumanRealConfigRemove([row.id]);
  await tableApi.query();
}

// 单独的启动操作函数
async function handleStart(row: AihumanRealConfigInfo) {
  console.log('handleStart called with row:', { id: row.id, runStatus: row.runStatus });

  // 参数校验
  if (!row.id) {
    console.error('Invalid row ID:', row.id);
    Modal.error({
      title: '参数错误',
      content: '配置ID无效，无法执行操作',
    });
    return;
  }

  try {
    // 直接调用run接口
    console.log(`执行启动操作，调用/run接口，ID: ${row.id}`);
    const runResult = await aihumanRealConfigRun(row.id);
    console.log('启动操作结果:', runResult);

    // 刷新列表以更新运行状态
    console.log('启动操作成功，刷新列表');
    await tableApi.query();
  } catch (error) {
    console.error('启动操作执行失败:', error);
    // 显示错误提示
    Modal.error({
      title: '操作失败',
      content: '启动操作失败，请检查网络或服务状态',
    });
  }
}

// 单独的停止操作函数
async function handleStop(row: AihumanRealConfigInfo) {
  console.log('handleStop called with row:', { id: row.id, runStatus: row.runStatus });

  // 参数校验
  if (!row.id) {
    console.error('Invalid row ID:', row.id);
    Modal.error({
      title: '参数错误',
      content: '配置ID无效，无法执行操作',
    });
    return;
  }

  try {
    // 直接调用stop接口
    console.log(`执行停止操作，调用/stop接口，ID: ${row.id}`);
    const stopResult = await aihumanRealConfigStop(row.id);
    console.log('停止操作结果:', stopResult);

    // 刷新列表以更新运行状态
    console.log('停止操作成功，刷新列表');
    await tableApi.query();
  } catch (error) {
    console.error('停止操作执行失败:', error);
    // 显示错误提示
    Modal.error({
      title: '操作失败',
      content: '停止操作失败，请检查网络或服务状态',
    });
  }
}
function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: AihumanRealConfigInfo) => row.id);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      await aihumanRealConfigRemove(ids);
      await tableApi.query();
    },
  });
}

function handleDownloadExcel() {
  const formValues = tableApi.formApi.form.values;
  commonDownloadExcel(aihumanRealConfigExport, '真人交互数字人配置数据', formValues, {
    fieldMappingTime: formOptions.fieldMappingTime,
  });
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-[8px]">
      <BasicTable class="overflow-hidden flex-1" table-title="真人交互数字人配置列表">
        <template #toolbar-tools>
          <Space>
            <a-button v-access:code="['aihuman:aihumanRealConfig:export']" @click="handleDownloadExcel">
              {{ $t('pages.common.export') }}
            </a-button>
            <a-button :disabled="!vxeCheckboxChecked(tableApi)" danger type="primary"
              v-access:code="['aihuman:aihumanRealConfig:remove']" @click="handleMultiDelete">
              {{ $t('pages.common.delete') }}
            </a-button>
            <a-button type="primary" v-access:code="['aihuman:aihumanRealConfig:add']" @click="handleAdd">
              {{ $t('pages.common.add') }}
            </a-button>
          </Space>
        </template>
        <template #action="{ row }">
          <Space>

            <!-- 启动按钮 - 点击时直接执行handleStart函数 -->
            <ghost-button
              @click.stop="handleStart(row)"
              :disabled="row.runStatus === 1"
              style="margin-right: 8px;"
              v-access:code="['aihuman:aihumanRealConfig:run']"
            >
              <template #icon>
                <a-icon type="weui--play2-filled" :style="{ color: row.runStatus === 1 ? '#ccc' : 'green' }" />
              </template>
              启动
            </ghost-button>

            <!-- 停止按钮 - 点击时直接执行handleStop函数 -->
            <ghost-button
              @click.stop="handleStop(row)"
              :disabled="row.runStatus === 0"
              v-access:code="['aihuman:aihumanRealConfig:stop']"
            >
              <template #icon>
                <a-icon type="weui--close2-filled" :style="{ color: row.runStatus === 0 ? '#ccc' : 'red' }" />
              </template>
              停止
            </ghost-button>

            <ghost-button v-access:code="['aihuman:aihumanRealConfig:edit']" @click.stop="handleEdit(row)">
              {{ $t('pages.common.edit') }}
            </ghost-button>

            <Popconfirm :get-popup-container="getVxePopupContainer" placement="left" title="确认删除？"
              @confirm="handleDelete(row)">
              <ghost-button danger v-access:code="['aihuman:aihumanRealConfig:remove']" @click.stop="">
                {{ $t('pages.common.delete') }}
              </ghost-button>
            </Popconfirm>
          </Space>
        </template>
      </BasicTable>
    </div>
    <AihumanRealConfigModal @reload="tableApi.query()" />
  </Page>
</template>
