<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, cloneDeep, getPopupContainer } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';
import { categoryTree } from '#/api/workflow/category';
import {
  workflowDefinitionAdd,
  workflowDefinitionInfo,
  workflowDefinitionUpdate,
} from '#/api/workflow/definition';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [type: 'add' | 'update'] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 90,
  },
  schema: modalSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupCategorySelect() {
  // menu
  const tree = await categoryTree();
  addFullName(tree, 'label', ' / ');

  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: {
          label: 'label',
          value: 'id',
        },
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        showSearch: true,
        treeData: tree,
        treeDefaultExpandAll: true,
        // 默认展开的树节点
        // treeDefaultExpandedKeys: [0],
        treeLine: { showLeafIcon: false },
        // 筛选的字段
        treeNodeFilterProp: 'label',
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'category',
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicDrawer, modalApi] = useVbenModal({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    // 加载分类树选择
    await setupCategorySelect();
    if (isUpdate.value && id) {
      const record = await workflowDefinitionInfo(id);
      await formApi.setValues(record);
    }
    await markInitialized();

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    if (isUpdate.value) {
      await workflowDefinitionUpdate(data);
      emit('reload', 'update');
    } else {
      await workflowDefinitionAdd(data);
      emit('reload', 'add');
    }
    resetInitialized();
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :fullscreen-button="false" :title="title" class="w-[550px]">
    <div class="min-h-[400px]">
      <BasicForm />
    </div>
  </BasicDrawer>
</template>
