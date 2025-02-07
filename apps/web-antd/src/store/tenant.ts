import { ref } from 'vue';

import { defineStore } from 'pinia';

import {
  tenantList as tenantListApi,
  type TenantOption,
} from '#/api/core/auth';

export const useTenantStore = defineStore('app-tenant', () => {
  const checked = ref(false);
  const tenantEnable = ref(true);
  const tenantList = ref<TenantOption[]>([]);

  async function initTenant() {
    const { tenantEnabled, voList } = await tenantListApi();
    tenantEnable.value = tenantEnabled;
    tenantList.value = voList;
  }

  async function setChecked(_checked: boolean) {
    checked.value = _checked;
  }

  function $reset() {
    checked.value = false;
    tenantEnable.value = true;
    tenantList.value = [];
  }

  return {
    $reset,
    checked,
    initTenant,
    setChecked,
    tenantEnable,
    tenantList,
  };
});
