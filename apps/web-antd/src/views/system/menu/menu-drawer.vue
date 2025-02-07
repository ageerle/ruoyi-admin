<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import {
  addFullName,
  cloneDeep,
  getPopupContainer,
  listToTree,
} from '@vben/utils';

import { useVbenForm } from '#/adapter';
import { menuAdd, menuInfo, menuList, menuUpdate } from '#/api/system/menu';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

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
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupMenuSelect() {
  // menu
  const menuArray = await menuList();
  // const folderArray = menuArray.filter((item) => item.menuType === 'M');
  const menuTree = listToTree(menuArray, { id: 'menuId', pid: 'parentId' });
  const fullMenuTree = [
    {
      menuId: 0,
      menuName: '根目录',
      children: menuTree,
    },
  ];
  addFullName(fullMenuTree, 'menuName', ' / ');

  formApi.updateSchema([
    {
      componentProps: {
        fieldNames: {
          label: 'menuName',
          value: 'menuId',
        },
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        showSearch: true,
        treeData: fullMenuTree,
        treeDefaultExpandAll: false,
        // 默认展开的树节点
        treeDefaultExpandedKeys: [0],
        treeLine: { showLeafIcon: false },
        // 筛选的字段
        treeNodeFilterProp: 'menuName',
        treeNodeLabelProp: 'fullName',
      },
      fieldName: 'parentId',
    },
  ]);
}

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;
    // 加载菜单树选择
    await setupMenuSelect();
    if (isUpdate.value && id) {
      const record = await menuInfo(id);
      await formApi.setValues(record);
    }
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? menuUpdate(data) : menuAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.drawerLoading(false);
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm />
  </BasicDrawer>
</template>
