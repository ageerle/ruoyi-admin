<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Button, message, Skeleton } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { tenantAdd, tenantInfo, tenantUpdate } from '#/api/system/tenant';
import { packageSelectList } from '#/api/system/tenant-package';
import { useTenantStore } from '#/store/tenant';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    labelWidth: 100,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const router = useRouter();
async function setupPackageSelect() {
  const tenantPackageList = await packageSelectList();
  /**
   * 检测是否存在租户套餐 你也不想表单填完了发现套餐为0无法选中吧
   */
  if (tenantPackageList.length === 0) {
    const closeMessage = message.error(
      h('span', {}, [
        '请先配置租户套餐',
        h(
          Button,
          {
            onClick: () => {
              router.push('/tenant/tenantPackage');
              closeMessage();
            },
            type: 'link',
            size: 'small',
          },
          '前往配置',
        ),
      ]),
    );
    throw new Error('请先配置租户套餐');
  }

  const options = tenantPackageList.map((item) => ({
    label: item.packageName,
    value: item.packageId,
  }));
  formApi.updateSchema([
    {
      componentProps: {
        optionFilterProp: 'label',
        optionLabelProp: 'label',
        options,
        showSearch: true,
      },
      fieldName: 'packageId',
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const loading = ref(false);
const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    loading.value = true;

    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const [record] = await Promise.all([
        tenantInfo(id),
        setupPackageSelect(),
      ]);
      await formApi.setValues(record);
    } else {
      await setupPackageSelect();
    }

    formApi.updateSchema([
      {
        fieldName: 'packageId',
        componentProps: {
          disabled: isUpdate.value,
        },
      },
    ]);
    await markInitialized();

    drawerApi.drawerLoading(false);
    loading.value = false;
  },
});

const tenantStore = useTenantStore();
async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? tenantUpdate(data) : tenantAdd(data));
    resetInitialized();
    emit('reload');
    drawerApi.close();
    // 重新加载租户信息
    tenantStore.initTenant();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <Skeleton v-if="loading" active />
    <BasicForm v-show="!loading" />
  </BasicDrawer>
</template>

<style lang="scss" scoped>
:deep(.ant-divider) {
  margin: 8px 0;
}
</style>
