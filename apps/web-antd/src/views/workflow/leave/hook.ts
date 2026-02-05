import { onActivated, onMounted, ref } from 'vue';

import { createGlobalState } from '@vueuse/core';

export function useRouteIdEdit(callback: (id: string) => void, timeout = 500) {
  const { businessId } = useQueryId();
  function openEditFromRouteId() {
    const id = businessId.value;
    if (!id) {
      return;
    }
    setTimeout(() => {
      // 回调
      callback?.(id);
      // 执行完 清理id
      businessId.value = '';
    }, timeout);
  }

  onMounted(openEditFromRouteId);
  onActivated(openEditFromRouteId);
}

/**
 * 用来存储业务ID 传值
 */
export const useQueryId = createGlobalState(() => {
  const businessId = ref('');

  return {
    businessId,
  };
});
