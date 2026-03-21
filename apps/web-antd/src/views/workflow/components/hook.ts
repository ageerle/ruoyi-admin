import { onMounted, useTemplateRef, watch } from 'vue';

import { usePreferences } from '@vben/preferences';

/**
 * warmflow ref相关操作
 * @returns hook
 */
export function useWarmflowIframe() {
  const iframeRef = useTemplateRef<HTMLIFrameElement>('iframeRef');
  const { isDark } = usePreferences();

  async function iframeLoadEvent() {
    /**
     * TODO: 这里可以优化 因为拿不到内部vue的mount状态
     */
    await new Promise((resolve) => setTimeout(resolve, 500));
    const theme = isDark.value ? 'theme-dark' : 'theme-light';
    iframeRef.value?.contentWindow?.postMessage({ type: theme });
  }

  onMounted(() => {
    /**
     * load只是iframe加载完 而非vue加载完
     */
    iframeRef.value?.addEventListener('load', iframeLoadEvent);
  });

  // onBeforeUnmount(() => {
  //   iframeRef.value?.removeEventListener('load', iframeLoadEvent);
  // });

  // 监听主题切换 通知iframe切换
  watch(isDark, (dark) => {
    if (!iframeRef.value) {
      return;
    }
    const theme = dark ? 'theme-dark' : 'theme-light';
    iframeRef.value.contentWindow?.postMessage({ type: theme });
  });

  return { iframeRef };
}
