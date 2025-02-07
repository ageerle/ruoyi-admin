<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { BookOpenText, CircleHelp, MdiGithub, ProfileIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { message } from 'ant-design-vue';

import { TenantToggle } from '#/components/tenant-toggle';
import { $t } from '#/locales';
import { resetRoutes } from '#/router';
import { useAuthStore, useNotifyStore } from '#/store';
import { useTenantStore } from '#/store/tenant';
import LoginForm from '#/views/_core/authentication/login.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const router = useRouter();

const tenantStore = useTenantStore();
const menus = computed(() => {
  const defaultMenus = [
    // {
    //   handler: () => {
    //     openWindow(VBEN_DOC_URL, {
    //       target: '_blank',
    //     });
    //   },
    //   icon: BookOpenText,
    //   text: $t('widgets.document'),
    // },
    {
      handler: () => {
        router.push('/profile');
      },
      icon: ProfileIcon,
      text: $t('widgets.profile'),
    },
    // {
    //   handler: () => {
    //     openWindow(VBEN_GITHUB_URL, {
    //       target: '_blank',
    //     });
    //   },
    //   icon: MdiGithub,
    //   text: 'GitHub',
    // },
    // {
    //   handler: () => {
    //     openWindow(`${VBEN_GITHUB_URL}/issues`, {
    //       target: '_blank',
    //     });
    //   },
    //   icon: CircleHelp,
    //   text: $t('widgets.qa'),
    // },
  ];
  /**
   * 租户选中状态 不显示个人中心
   */
  if (tenantStore.checked) {
    defaultMenus.splice(1, 1);
  }
  return defaultMenus;
});

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout();
  resetRoutes();
}

const notifyStore = useNotifyStore();
onMounted(() => notifyStore.startListeningMessage());

function handleViewAll() {
  message.warning('暂未开放');
}
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #header-right-1>
      <TenantToggle />
    </template>
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="ageerle@163.com"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="notifyStore.showDot"
        :notifications="notifyStore.notifications"
        @clear="notifyStore.clearAllMessage"
        @make-all="notifyStore.setAllRead"
        @read="notifyStore.setRead"
        @view-all="handleViewAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
