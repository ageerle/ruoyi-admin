import type { App } from 'vue';

import { Button as AButton } from 'ant-design-vue';

/**
 * 全局组件注册
 */
export function setupGlobalComponent(app: App) {
  app.use(AButton);
}
