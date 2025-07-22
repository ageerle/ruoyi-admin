<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="字段管理列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            type="primary"
            v-access:code="['dev:schemaField:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>

      <template #action="{ row }">
        <Space>
          <ghost-button
            v-access:code="['dev:schemaField:edit']"
            @click.stop="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <ghost-button
              danger
              v-access:code="['dev:schemaField:remove']"
              @click.stop=""
            >
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ModalComponent @reload="tableApi.query()"/>
  </Page>
</template>

<script setup lang="ts">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {$t} from '@vben/locales';
import {getVxePopupContainer} from '@vben/utils';

import {message, Popconfirm, Space} from 'ant-design-vue';
import {deleteSchemaField, getSchemaFieldList} from '#/api/dev/schemaField';

import {columns, querySchema} from './data';
import SchemaFieldModal from './schema-field-modal.vue';

import {onMounted, ref, watch} from 'vue';

interface Props {
  schemaId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  schemaId: undefined,
});

const saving = ref(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 110,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    // 高亮
    highlight: true,
    // 翻页时保留选中状态
    reserve: true,
  },
  border: true,
  showOverflow: true,
  keepSource: true,
  height: 'auto',
  rowConfig: {
    keyField: 'id',
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  editConfig: {
    trigger: 'click',
    mode: 'cell',
    showStatus: true,
  },
  pagerConfig: {},
  columns: [
    ...columns,
    {
      title: '操作',
      field: 'action',
      width: 120,
      fixed: 'right',
      slots: {default: 'action'},
    },
  ],
  proxyConfig: {
    ajax: {
      query: async ({page}, formValues = {}) => {
        const searchSchemaId = formValues?.schemaId || props.schemaId;
        try {
          return await getSchemaFieldList({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            schemaId: searchSchemaId,
            ...formValues,
          });
        } catch (error) {
          console.error('获取字段列表失败:', error);
          message.error('获取字段列表失败');
          return {
            result: [],
            page: {
              total: 0,
            },
          };
        }
      },
    },
  },
  // 表格全局唯一表示 保存列配置需要用到
  id: 'dev-schema-field-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [ModalComponent, modalApi] = useVbenModal({
  connectedComponent: SchemaFieldModal,
});


// 新增字段
function handleAdd() {
  const formData = tableApi.formApi?.form?.values || {};
  const currentSchemaId = formData?.schemaId || props.schemaId;
  modalApi.setData({
    schemaId: currentSchemaId
  });
  modalApi.open();
}

// 编辑字段
function handleEdit(record: any) {
  const formData = tableApi.formApi?.form?.values || {};
  const currentSchemaId = formData?.schemaId || props.schemaId;
  modalApi.setData({
    id: record.id,
    schemaId: currentSchemaId,
    record
  });
  modalApi.open();
}

// 删除字段
async function handleDelete(record: any) {
  try {
    await deleteSchemaField(record.id);
    message.success('删除成功');
    await tableApi.query();
  } catch (error) {
    console.error('删除失败:', error);
    message.error('删除失败');
  }
}


// 监听schemaId变化
watch(() => props.schemaId, (newSchemaId) => {
  if (newSchemaId) {
    // 如果有props.schemaId，设置到表单中
    tableApi.formApi?.setValues({schemaId: newSchemaId});
    tableApi.query();
  }
}, {immediate: true});

onMounted(() => {
  // 如果没有传入schemaId，也要初始化查询
  if (!props.schemaId) {
    tableApi.query();
  }
});
</script>
