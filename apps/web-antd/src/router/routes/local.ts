import type { RouteRecordStringComponent } from '@vben/types';

import { $t } from '@vben/locales';

/**
 * 该文件放非后台返回的路由 比如个人中心 等需要跳转显示的页面
 */

/**
 * 个人中心
 */
const profileRoute: RouteRecordStringComponent[] = [
  {
    component: 'BasicLayout',
    meta: {
      hideChildrenInMenu: true,
      hideInMenu: true,
      title: $t('widgets.profile'),
    },
    name: 'Profile',
    path: '/',
    redirect: '/profile',
    children: [
      {
        component: '/_core/profile/index',
        meta: {
          icon: 'mingcute:profile-line',
          keepAlive: true,
          title: $t('widgets.profile'),
        },
        name: 'ProfileIndex',
        path: '/profile',
      },
    ],
  },
  {
    component: 'BasicLayout',
    meta: {
      hideChildrenInMenu: true,
      hideInMenu: true,
      title: 'oss配置',
    },
    name: 'OssConfig',
    path: '/',
    redirect: '/system/oss-config',
    children: [
      {
        component: '/system/oss-config/index',
        meta: {
          activePath: '/system/oss',
          icon: 'mingcute:profile-line',
          keepAlive: true,
          title: 'oss配置',
        },
        name: 'OssConfigIndex',
        path: '/system/oss-config',
      },
    ],
  },
  // TODO: 图标要改
  {
    component: 'BasicLayout',
    meta: {
      hideChildrenInMenu: true,
      hideInMenu: true,
      title: '修改生成配置',
    },
    name: 'GenConfig',
    path: '/',
    redirect: '/code-gen/edit',
    children: [
      {
        component: '/tool/gen/edit-gen',
        meta: {
          activePath: '/tool/gen',
          icon: 'mingcute:profile-line',
          keepAlive: true,
          title: '生成配置',
        },
        name: 'GenConfigIndex',
        path: '/code-gen/edit/:tableId',
      },
    ],
  },
  {
    component: 'BasicLayout',
    meta: {
      hideChildrenInMenu: true,
      hideInMenu: true,
      title: '分配角色',
    },
    name: 'RoleAssign',
    path: '/',
    redirect: '/system/role-assign',
    children: [
      {
        component: '/system/role-assign/index',
        meta: {
          activePath: '/system/role',
          icon: 'mingcute:profile-line',
          keepAlive: true,
          title: '分配角色',
        },
        name: 'RoleAssignIndex',
        path: '/system/role-assign/:roleId',
      },
    ],
  },
];

/**
 * 这里放本地路由
 */
export const localMenuList: RouteRecordStringComponent[] = [
  {
    component: 'BasicLayout',
    meta: {
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/',
    redirect: '/Workspace',
    children: [
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },
      
    ],
  },

  ...profileRoute,
];
