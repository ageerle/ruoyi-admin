import type { ExtendedFormApi } from '@vben/common-ui';
import type { MaybePromise } from '@vben/types';

import { ref } from 'vue';

import { $t } from '@vben/locales';

import { Modal } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

interface BeforeCloseDiffProps {
  /**
   * 初始化值如何获取
   * @returns Promise<string>
   */
  initializedGetter: () => MaybePromise<string>;
  /**
   * 当前值如何获取
   * @returns Promise<string>
   */
  currentGetter: () => MaybePromise<string>;
  /**
   * 自定义比较函数
   * @param init 初始值
   * @param current 当前值
   * @returns boolean
   */
  compare?: (init: string, current: string) => boolean;
}

/**
 * 用于Drawer/Modal使用 判断表单是否有变动来决定是否弹窗提示
 * @param props props
 * @returns hook
 */
export function useBeforeCloseDiff(props: BeforeCloseDiffProps) {
  const { initializedGetter, currentGetter, compare } = props;
  /**
   * 记录初始值 json
   */
  const initialized = ref<string>('');
  /**
   * 是否已经初始化了 通过这个值判断是否需要进行对比 为false直接关闭 不弹窗
   */
  const isInitialized = ref(false);

  /**
   * 标记是否已经完成初始化 后续需要进行对比
   * @param data 自定义初始化数据 可选
   */
  async function markInitialized(data?: string) {
    initialized.value = data || (await initializedGetter());
    isInitialized.value = true;
  }

  /**
   * 重置初始化状态 需要在closed前调用 或者打开窗口时
   */
  function resetInitialized() {
    initialized.value = '';
    isInitialized.value = false;
  }

  /**
   * 提供给useVbenForm/useVbenDrawer使用
   * @returns 是否允许关闭
   */
  async function onBeforeClose(): Promise<boolean> {
    // 如果还未初始化，直接允许关闭
    if (!isInitialized.value) {
      return true;
    }

    try {
      // 获取当前表单数据
      const current = await currentGetter();
      // 自定义比较的情况
      if (isFunction(compare) && compare(initialized.value, current)) {
        return true;
      } else {
        // 如果数据没有变化，直接允许关闭
        if (current === initialized.value) {
          return true;
        }
      }

      // 数据有变化，显示确认对话框
      return new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: $t('pages.common.tip'),
          content: $t('pages.common.beforeCloseTip'),
          centered: true,
          okButtonProps: { danger: true },
          cancelText: $t('common.cancel'),
          okText: $t('common.confirm'),
          onOk: () => {
            resolve(true);
            isInitialized.value = false;
          },
          onCancel: () => resolve(false),
        });
      });
    } catch (error) {
      console.error('Failed to compare data:', error);
      return true;
    }
  }

  return {
    onBeforeClose,
    markInitialized,
    resetInitialized,
  };
}

/**
 * 给useVbenForm使用的 封装函数
 * @param formApi 表单实例
 * @returns getter
 */
export function defaultFormValueGetter(formApi: ExtendedFormApi) {
  return async () => {
    const v = await formApi.getValues();
    return JSON.stringify(v);
  };
}
