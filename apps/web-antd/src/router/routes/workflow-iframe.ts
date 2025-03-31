import type { RouteRecordRaw } from '@vben/types';

/**
 * 该文件存放workflow表单的iframe内嵌路由
 * 不需要权限认证 少走两个接口😅
 */
export const workflowIframeRoutes: RouteRecordRaw[] = [
  // 这里是iframe使用的 去掉外层的BasicLayout
  {
    name: 'WorkflowLeaveInner',
    path: '/workflow/leaveEdit/index/iframe',
    component: () => import('#/views/workflow/leave/leave-form.vue'),
    meta: {
      hideInTab: true,
      title: '请假申请',
    },
  },
];
