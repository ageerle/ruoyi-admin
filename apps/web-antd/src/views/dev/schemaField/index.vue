<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="字段管理列表">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" v-access:code="['dev:schemaField:add']" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
          <a-button type="default" @click="handleGenerate">
            {{ $t('pages.common.generate') }}
          </a-button>
        </Space>
      </template>

      <template #action="{ row }">
        <Space>
          <ghost-button v-access:code="['dev:schemaField:edit']" @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </ghost-button>
          <Popconfirm :get-popup-container="getVxePopupContainer" placement="left" title="确认删除？"
                      @confirm="handleDelete(row)">
            <ghost-button danger v-access:code="['dev:schemaField:remove']" @click.stop="">
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ModalComponent :schemaOptions="schemaOptions" @reload="tableApi.query()"/>
    <GenerateModalComponent @handleGen="handleGen"/>
  </Page>
</template>

<script setup lang="ts">
import type {VbenFormProps} from '@vben/common-ui';
import {Page, useVbenModal} from '@vben/common-ui';
import {onMounted, ref, watch} from 'vue';

import type {VxeGridProps} from '#/adapter/vxe-table';
import {useVbenVxeGrid} from '#/adapter/vxe-table';
import {$t} from '@vben/locales';
import {getVxePopupContainer} from '@vben/utils';

import {message, notification, Popconfirm, Space} from 'ant-design-vue';
import {deleteSchemaField, getSchemaFieldList} from '#/api/dev/schemaField/schemaField';
import type {SchemaGenerateParams, SchemaInfo} from '#/api/dev/schema/types';
import {batchGenCode, batchGenFrontendCode, schemaList} from '#/api/dev/schema/schema';

import {columns, querySchema} from './data';
import SchemaFieldModal from './schema-field-modal.vue';
import GenerateFieldModal from "./generate-field-modal.vue";

interface Props {
  schemaId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  schemaId: undefined,
});

const schemaOptions = ref<SchemaInfo[]>([]);
const loading = ref(false);

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 110,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  submitOnChange: true,
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

// 生成参数表单
const [GenerateModalComponent, generateModalApi] = useVbenModal({
  connectedComponent: GenerateFieldModal,
});

// 新增字段
function handleAdd() {
  const formData = tableApi.formApi?.form?.values || {};
  const currentSchemaId = formData?.schemaId || props.schemaId;
  if (!currentSchemaId) {
    return message.warning('请先选择数据模型');
  }
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

// 设置生成代码参数
async function handleGenerate() {
  const formData = tableApi.formApi?.form?.values || {};
  const currentSchemaId = formData?.schemaId || props.schemaId;
  if (!currentSchemaId) {
    return message.warning('请先选择数据模型');
  }
  const tarSchemaOption = schemaOptions.value.find((row: SchemaInfo) => row.id === currentSchemaId);
  if (!tarSchemaOption) {
    return message.warning('数据错误');
  }

  generateModalApi.setData({
    tableName: tarSchemaOption.tableName,
  });
  generateModalApi.open();
}

async function callApi(tip: 'frontend' | 'backend', params: SchemaGenerateParams) {
  loading.value = true;
  const hide = message.loading(`正在生成${tip === 'frontend' ? '前端' : '后端'}代码，请稍候...`, 0);
  try {
    let res;
    if (tip === 'frontend') {
      res = await batchGenFrontendCode(params.workPath!, params.previewCode!);
    } else if (tip === 'backend') {
      res = await batchGenCode(params.tableName!);
    } else {
      throw new Error('不支持的类型');
    }
    notification.success({
      message: '生成成功',
      description: `生成${tip === 'frontend' ? '前端' : '后端'}代码完成`,
    });
    return res;
  } catch (e) {
    message.error(`生成${tip === 'frontend' ? '前端' : '后端'}代码失败`);
    throw e;
  } finally {
    hide();          // 确保关闭加载提示
    loading.value = false;
  }
}


// 生成代码
async function handleGen(params: SchemaGenerateParams) {
  console.log(params, 'params');
  try {
    if (params.genType === 'all') {
      // 先后端再前端，因为前端生成完就重载了
      await callApi('backend', params);
      await callApi('frontend', params);
    } else if (params.genType === 'backend' || params.genType === 'frontend') {
      await callApi(params.genType, params);
    } else {
      message.warning('未知的生成类型');
    }
  } catch (e) {
    console.error(e);
  }
}

// 获取模型列表
const loadSchemaOptions = async () => {
  try {
    const response = await schemaList({pageSize: 1000});
    schemaOptions.value = response.rows || [];
  } catch (error) {
    console.error('获取模型列表失败:', error);
  }
};

// 监听schemaId变化
watch(() => props.schemaId, (newSchemaId) => {
  if (newSchemaId) {
    // 如果有props.schemaId，设置到表单中
    tableApi.formApi?.setValues({schemaId: newSchemaId});
    tableApi.query();
  }
}, {immediate: true});

// 组件挂载时加载模型列表
onMounted(() => {
  loadSchemaOptions();
});

onMounted(() => {
  // 如果没有传入schemaId，也要初始化查询
  if (!props.schemaId) {
    tableApi.query();
  }
});
</script>
