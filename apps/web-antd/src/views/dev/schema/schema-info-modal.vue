<template>
  <VbenModal
    v-model:open="modalState.isOpen"
    :loading="modalState.loading"
    :title="modalState.title"
    class="schema-info-modal"
    width="800px"
    @close="handleClose"
  >
    <div class="p-4">
      <a-descriptions :column="2" bordered>

        <a-descriptions-item label="分组ID">

          {{ info.schemaGroupId || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="模型名称">

          {{ info.name || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="模型编码">

          {{ info.code || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="表名">

          {{ info.tableName || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="表注释">

          {{ info.comment || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="存储引擎">

          {{ info.engine || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="列表字段">

          {{ info.listKeys || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="搜索表单字段">

          {{ info.searchFormKeys || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="表单设计">

          {{ info.designer || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="状态（0正常 1停用）">

          {{ info.status || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="排序">

          {{ info.sort || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="备注">

          {{ info.remark || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="删除标志（0代表存在 2代表删除）">

          {{ info.delFlag || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="租户编号">

          {{ info.tenantId || '-' }}

        </a-descriptions-item>

        <a-descriptions-item label="创建部门">

          {{ info.createDept || '-' }}

        </a-descriptions-item>

      </a-descriptions>
    </div>
  </VbenModal>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { VbenModal } from '@vben/common-ui';
import dayjs from 'dayjs';

import { getSchema } from './api';


interface Props {
  id?: number | string;
}

defineOptions({ name: 'SchemaInfoModal' });

const props = withDefaults(defineProps<Props>(), {
  id: '',
});

const modalState = reactive({
  isOpen: false,
  loading: false,
  title: '数据模型表详情',
});

const info = ref<any>({});

/**
 * 打开模态框
 */
async function openModal() {
  modalState.isOpen = true;

  if (props.id) {
    modalState.loading = true;
    try {
      const data = await getSchema(props.id);
      info.value = data;
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      modalState.loading = false;
    }
  }
}

/**
 * 关闭模态框
 */
function handleClose() {
  modalState.isOpen = false;
  info.value = {};
}

defineExpose({
  openModal,
});
</script>