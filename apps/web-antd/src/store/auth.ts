import type { LoginAndRegisterParams } from '@vben/common-ui';
import type { UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import { doLogout, getUserInfoApi, loginApi, seeConnectionClose } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: LoginAndRegisterParams,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { token } = await loginApi(params);

      // 将 accessToken 存储到 accessStore 中
      accessStore.setAccessToken(token);
      accessStore.setRefreshToken(token);

      // 获取用户信息并存储到 accessStore 中
      userInfo = await fetchUserInfo();
      /**
       * 设置用户信息
       */
      userStore.setUserInfo(userInfo);
      /**
       * 在这里设置权限
       */
      accessStore.setAccessCodes(userInfo.permissions);

      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        onSuccess ? await onSuccess?.() : await router.push(DEFAULT_HOME_PATH);
      }

      if (userInfo?.realName) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await seeConnectionClose();
      await doLogout();
    } catch (error) {
      console.error(error);
    } finally {
      resetAllStores();
      accessStore.setLoginExpired(false);

      // 回登陆页带上当前路由地址
      await router.replace({
        path: LOGIN_PATH,
        query: redirect
          ? {
              redirect: encodeURIComponent(router.currentRoute.value.fullPath),
            }
          : {},
      });
    }
  }

  async function fetchUserInfo() {
    const { permissions = [], roles = [], user } = await getUserInfoApi();

    /**
     * 从后台user -> vben user转换
     */
    const userInfo: UserInfo = {
      avatar: user.avatar ?? '',
      permissions,
      realName: user.nickName,
      roles,
      userId: user.userId,
      username: user.userName,
    };
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
