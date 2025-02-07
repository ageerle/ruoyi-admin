import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    /**
     * 不要动这里  后端路由模式
     */
    accessMode: 'backend',
    /**
     * 不需要refresh token 由后端处理
     */
    enableRefreshToken: false,
    name: import.meta.env.VITE_APP_TITLE,
  },
  footer: {
    /**
     * 不显示footer
     */
    enable: false,
  },
  tabbar: {
    /**
     * 标签tab 持久化 关闭
     */
    persist: false,
    // styleType: 'card',
  },
  theme: {
    /**
     * 浅色sidebar
     */
    semiDarkSidebar: false,
  },
});
