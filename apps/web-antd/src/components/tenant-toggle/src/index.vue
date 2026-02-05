<script setup lang="ts">
import type { MessageType } from 'ant-design-vue/es/message';
import type { SelectHandler } from 'ant-design-vue/es/vc-select/Select';

import type { TenantOption } from '#/api';

import { computed, onMounted, ref, shallowRef, unref } from 'vue';
import { useRoute } from 'vue-router';

import { useAccess } from '@vben/access';
import { useTabs } from '@vben/hooks';
import { $t } from '@vben/locales';

import { message, Select, Spin } from 'ant-design-vue';
import { storeToRefs } from 'pinia';

import { tenantDynamicClear, tenantDynamicToggle } from '#/api/system/tenant';
import { useDictStore } from '#/store/dict';
import { useTenantStore } from '#/store/tenant';

const { hasAccessByRoles } = useAccess();

// 上一次选择的租户
const lastSelected = ref<string>();
// 当前选择租户的id
const selected = ref<string>();

const tenantStore = useTenantStore();
const { initTenant, setChecked } = tenantStore;
const { tenantEnable, tenantList } = storeToRefs(tenantStore);

const showToggle = computed<boolean>(() => {
  // 超级管理员 && 启用租户
  return hasAccessByRoles(['superadmin']) && unref(tenantEnable);
});

onMounted(async () => {
  // 没有超级管理员权限 不会调用接口
  if (!hasAccessByRoles(['superadmin'])) {
    return;
  }
  await initTenant();
});

const route = useRoute();
const { closeOtherTabs, refreshTab, closeAllTabs } = useTabs();

async function close(checked: boolean) {
  // store设置状态
  setChecked(checked);

  /**
   * 切换租户需要回到首页的页面 一般为带id的页面
   * 其他则直接刷新页面
   */
  if (route.meta.requireHomeRedirect) {
    await closeAllTabs();
  } else {
    // 先关闭再刷新 这里不用Promise.all()
    await closeOtherTabs();
    await refreshTab();
  }
}

const dictStore = useDictStore();
// 用于清理上一条message
const messageInstance = shallowRef<MessageType | null>();
// loading加载中效果
const loading = ref(false);

/**
 * 选中租户的处理
 * @param tenantId tenantId
 * @param option 当前option
 */
const onSelected: SelectHandler = async (tenantId: string, option: any) => {
  if (unref(lastSelected) === tenantId) {
    // createMessage.info('选择一致');
    return;
  }
  try {
    loading.value = true;

    await tenantDynamicToggle(tenantId);
    lastSelected.value = tenantId;

    // 关闭之前的message 只保留一条
    messageInstance.value?.();
    messageInstance.value = message.success(
      `${$t('component.tenantToggle.switch')} ${option.companyName}`,
    );

    close(true);
    // 需要放在宏队列处理 直接清空页面由于没有字典会有样式问题(标签变成unknown)
    setTimeout(() => dictStore.resetCache());
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

async function onDeselect() {
  try {
    loading.value = true;

    await tenantDynamicClear();
    // 关闭之前的message 只保留一条
    messageInstance.value?.();
    messageInstance.value = message.success($t('component.tenantToggle.reset'));

    lastSelected.value = '';
    close(false);
    // 需要放在宏队列处理 直接清空页面由于没有字典会有样式问题(标签变成unknown)
    setTimeout(() => dictStore.resetCache());
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

/**
 * select搜索使用
 * @param input 输入内容
 * @param option 选项
 */
function filterOption(input: string, option: TenantOption) {
  return option.companyName.toLowerCase().includes(input.toLowerCase());
}
</script>

<template>
  <div v-if="showToggle" class="mr-[8px] hidden md:block">
    <Select
      v-model:value="selected"
      :disabled="loading"
      :field-names="{ label: 'companyName', value: 'tenantId' }"
      :filter-option="filterOption"
      :options="tenantList"
      :placeholder="$t('component.tenantToggle.placeholder')"
      :dropdown-style="{ position: 'fixed', zIndex: 1024 }"
      allow-clear
      class="w-60"
      show-search
      @deselect="onDeselect"
      @select="onSelected"
    >
      <template v-if="loading" #suffixIcon>
        <Spin size="small" spinning />
      </template>
    </Select>
  </div>
</template>

<style lang="scss" scoped>
// 当选中时 添加border样式
:deep(.ant-select-selector) {
  &:has(.ant-select-selection-item) {
    box-shadow: 0 0 10px hsl(var(--primary));
  }
}
</style>
