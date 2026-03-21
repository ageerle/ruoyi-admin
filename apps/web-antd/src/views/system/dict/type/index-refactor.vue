<!-- 使用vxe实现成本最小 且自带虚拟滚动  -->
<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DictType } from '#/api/system/dict/dict-type-model';

import { h, ref, shallowRef, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cn } from '@vben/utils';

import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue';
import {
  Alert,
  Input,
  Modal,
  Popconfirm,
  Space,
  Tooltip,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  dictTypeExport,
  dictTypeList,
  dictTypeRemove,
  refreshDictTypeCache,
} from '#/api/system/dict/dict-type';
import { commonDownloadExcel } from '#/utils/file/download';

import { emitter } from '../mitt';
import dictTypeModal from './dict-type-modal.vue';

const tableAllData = shallowRef<DictType[]>([]);
const gridOptions: VxeGridProps = {
  columns: [
    {
      title: 'name',
      field: 'render',
      slots: { default: 'render' },
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        const resp = await dictTypeList();

        total.value = resp.total;
        tableAllData.value = resp.rows;
        return resp;
      },
    },
  },
  rowConfig: {
    keyField: 'dictId',
    // 高亮当前行
    isCurrent: true,
  },
  cellConfig: {
    height: 60,
  },
  showHeader: false,
  toolbarConfig: {
    enabled: false,
  },
  // 开启虚拟滚动
  scrollY: {
    enabled: false,
    gt: 0,
  },
  rowClassName: 'cursor-pointer',
  id: 'system-dict-data-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  gridOptions,
  gridEvents: {
    cellClick: ({ row }) => {
      handleRowClick(row);
    },
  },
});

const [DictTypeModal, modalApi] = useVbenModal({
  connectedComponent: dictTypeModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: DictType) {
  modalApi.setData({ id: record.dictId });
  modalApi.open();
}

async function handleDelete(row: DictType) {
  await dictTypeRemove([row.dictId]);
  await tableApi.query();
}

async function handleReset() {
  currentRowId.value = '';
  searchValue.value = '';
  await tableApi.query();
}

function handleDownloadExcel() {
  commonDownloadExcel(dictTypeExport, '字典类型数据');
}

function handleRefreshCache() {
  Modal.confirm({
    title: '提示',
    content: '确认刷新字典类型缓存吗？',
    okButtonProps: {
      danger: true,
    },
    onOk: async () => {
      await refreshDictTypeCache();
      await tableApi.query();
    },
  });
}

const lastDictType = ref<string>('');
const currentRowId = ref<null | number | string>(null);
function handleRowClick(row: DictType) {
  if (lastDictType.value === row.dictType) {
    return;
  }
  currentRowId.value = row.dictId;
  emitter.emit('rowClick', row.dictType);
}

const searchValue = ref('');
const total = ref(0);
watch(searchValue, (value) => {
  if (!tableApi) {
    return;
  }
  if (value) {
    const names = tableAllData.value.filter((item) =>
      item.dictName.includes(searchValue.value),
    );
    const types = tableAllData.value.filter((item) =>
      item.dictType.includes(searchValue.value),
    );
    const filtered = [...new Set([...names, ...types])];
    total.value = filtered.length;
    tableApi.grid.loadData(filtered);
  } else {
    total.value = tableAllData.value.length;
    tableApi.grid.loadData(tableAllData.value);
  }
});
</script>

<template>
  <div
    :class="
      cn(
        'bg-background flex max-h-[100vh] w-[360px] flex-col overflow-y-hidden',
        'rounded-lg',
        'dict-type-card',
      )
    "
  >
    <div :class="cn('flex items-center justify-between', 'border-b px-4 py-2')">
      <span class="font-semibold">字典项列表</span>
      <Space>
        <Tooltip title="刷新缓存">
          <a-button
            v-access:code="['system:dict:edit']"
            :icon="h(SyncOutlined)"
            @click="handleRefreshCache"
          />
        </Tooltip>
        <Tooltip :title="$t('pages.common.export')">
          <a-button
            v-access:code="['system:dict:export']"
            :icon="h(ExportOutlined)"
            @click="handleDownloadExcel"
          />
        </Tooltip>
        <Tooltip :title="$t('pages.common.add')">
          <a-button
            v-access:code="['system:dict:add']"
            :icon="h(PlusOutlined)"
            @click="handleAdd"
          />
        </Tooltip>
      </Space>
    </div>
    <div class="flex flex-1 flex-col overflow-y-hidden p-4">
      <Alert
        class="mb-4"
        show-icon
        message="如果你的数据量大 自行开启虚拟滚动"
      />
      <Input
        placeholder="搜索字典项名称/类型"
        v-model:value="searchValue"
        allow-clear
      >
        <template #addonAfter>
          <Tooltip title="重置/刷新">
            <SyncOutlined
              v-access:code="['system:dict:edit']"
              @click="handleReset"
            />
          </Tooltip>
        </template>
      </Input>
      <BasicTable class="flex-1 overflow-hidden">
        <template #render="{ row: item }">
          <div :class="cn('flex items-center justify-between px-2 py-2')">
            <div class="flex flex-col items-baseline overflow-hidden">
              <span class="font-medium">{{ item.dictName }}</span>
              <div
                class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {{ item.dictType }}
              </div>
            </div>
            <div class="flex items-center gap-3 text-[17px]">
              <EditOutlined
                class="text-primary"
                v-access:code="['system:dict:edit']"
                @click.stop="handleEdit(item)"
              />
              <Popconfirm
                placement="left"
                :title="`确认删除 [${item.dictName}]?`"
                @confirm="handleDelete(item)"
              >
                <DeleteOutlined
                  v-access:code="['system:dict:remove']"
                  class="text-destructive"
                  @click.stop=""
                />
              </Popconfirm>
            </div>
          </div>
        </template>
      </BasicTable>
    </div>
    <div class="border-t px-4 py-3">共 {{ total }} 条数据</div>
    <DictTypeModal @reload="tableApi.query()" />
  </div>
</template>

<style lang="scss">
.dict-type-card {
  .vxe-grid {
    padding: 12px 0 0;

    .vxe-body--row {
      &.row--current {
        // 选中行背景色
        background-color: hsl(var(--accent-hover)) !important;
      }
    }
  }

  .ant-alert {
    padding: 6px 12px;
  }
}
</style>
