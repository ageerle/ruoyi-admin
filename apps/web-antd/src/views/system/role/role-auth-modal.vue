<script setup lang="ts">
import type { DeptOption } from '#/api/system/role/model';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep, findGroupParentIds } from '@vben/utils';

import { uniq } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { roleDataScope, roleDeptTree, roleInfo } from '#/api/system/role';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { authModalSchemas } from './data';

const emit = defineEmits<{ reload: [] }>();

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: authModalSchemas(),
  showDefaultActions: false,
});

/**
 * 保存部门数据 用于获取祖先节点
 */
let treeData: DeptOption[] = [];
async function setupDeptTree(id: number | string) {
  const resp = await roleDeptTree(id);
  const { checkedKeys, depts } = resp;

  /**
   * 设置部门树数据
   */
  formApi.updateSchema([
    { fieldName: 'deptIds', componentProps: { treeData: depts } },
  ]);
  /**
   * 设置选中 必须先传递treeData
   * Note: Tree missing follow keys: '1981565541727186945'
   */
  await formApi.setFieldValue('deptIds', checkedKeys);
  treeData = depts;
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      treeData = [];
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id: number | string };

    const [record] = await Promise.all([roleInfo(id), setupDeptTree(id)]);
    await formApi.setValues(record);
    markInitialized();

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
    // formApi.getValues拿到的是一个readonly对象，不能直接修改，需要cloneDeep
    const data = cloneDeep(await formApi.getValues());
    // 不为自定义权限的话 删除部门id
    if (data.dataScope === '2') {
      let { deptIds, deptCheckStrictly } = data;
      // 节点关联 需要拼接上祖级ID(获取的是不带的)
      if (deptCheckStrictly) {
        // 找到所有父级ID
        const parentIds = findGroupParentIds(treeData, deptIds, { id: 'id' });
        // 去重
        deptIds = uniq([...parentIds, ...deptIds]);
      }
      // 赋值
      data.deptIds = deptIds;
    } else {
      data.deptIds = [];
    }
    await roleDataScope(data);
    resetInitialized();
    emit('reload');
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
  <BasicModal class="min-h-[600px] w-[550px]" title="分配权限">
    <BasicForm />
  </BasicModal>
</template>
