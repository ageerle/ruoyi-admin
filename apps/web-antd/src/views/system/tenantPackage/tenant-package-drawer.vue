<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep, listToTree } from '@vben/utils';

import { useVbenForm } from '#/adapter';
import { menuList, tenantPackageMenuTreeSelect } from '#/api/system/menu';
import {
  packageAdd,
  packageInfo,
  packageUpdate,
} from '#/api/system/tenant-package';
import { TreeSelectPanel } from '#/components/tree';

import { drawerSchema } from './data';
import TreeItem from './tree-item';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
  },
  layout: 'vertical',
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

async function setupMenuTreeSelect(id?: number | string) {
  if (id) {
    const resp = await tenantPackageMenuTreeSelect(id);
    await formApi.setFieldValue('menuIds', resp.checkedKeys);
  }
}

const menuTree = ref<any[]>([]);
async function setupMenuTree() {
  const resp = await menuList();
  const treeData = listToTree(resp, { id: 'menuId' });
  // 设置菜单信息
  menuTree.value = treeData;
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
    if (isUpdate.value && id) {
      const record = await packageInfo(id);
      await formApi.setValues(record);
    }
    /**
     * 加载菜单树和已勾选菜单
     */
    await Promise.all([setupMenuTree(), setupMenuTreeSelect(id)]);

    drawerApi.drawerLoading(false);
  },
});

/**
 * 这里拿到的是一个数组ref
 */
const menuSelectRef = ref();

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // 这个用于提交
    const menuIds = menuSelectRef.value?.[0]?.getCheckedKeys() ?? [];
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    data.menuIds = menuIds;
    await (isUpdate.value ? packageUpdate(data) : packageAdd(data));
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

/**
 * 通过回调更新 无法通过v-model
 * @param value 菜单选择是否严格模式
 */
function handleMenuCheckStrictlyChange(value: boolean) {
  formApi.setFieldValue('menuCheckStrictly', value);
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm>
      <template #menuIds="slotProps">
        <TreeSelectPanel
          ref="menuSelectRef"
          v-bind="slotProps"
          :check-strictly="formApi.form.values.menuCheckStrictly"
          :expand-all-on-init="true"
          :field-names="{ title: 'menuName', key: 'menuId' }"
          :tree-data="menuTree"
          @check-strictly-change="handleMenuCheckStrictlyChange"
        >
          <template #title="data">
            <TreeItem :data="data" />
          </template>
        </TreeSelectPanel>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
