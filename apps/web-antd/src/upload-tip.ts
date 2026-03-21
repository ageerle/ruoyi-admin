import { onMounted } from 'vue';

import { useLocalStorage } from '@vueuse/core';
import { Modal } from 'ant-design-vue';

export function useUploadTip() {
  const readTip = useLocalStorage<boolean>('__upload_tip_read_5.4.0', false);
  onMounted(() => {
    if (readTip.value || !import.meta.env.DEV) {
      return;
    }
    const modalInstance = Modal.info({
      title: '提示',
      centered: true,
      content:
        '如果你的版本是从低版本升级到后端>5.4.0, 记得执行升级sql, 否则跳转页面(如oss 代码生成配置)等会404',
      okButtonProps: { disabled: true },
      onOk() {
        modalInstance.destroy();
        readTip.value = true;
      },
    });

    let time = 3;
    const interval = setInterval(() => {
      modalInstance.update({
        okText: time === 0 ? '我知道了, 不再弹出' : `${time}秒后关闭`,
        okButtonProps: { disabled: time > 0 },
      });
      if (time <= 0) {
        clearInterval(interval);
      }
      time--;
    }, 1000);
  });
}
