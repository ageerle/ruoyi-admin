import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'carbon:workflow-automation',
      order: 100,
      title: '工作流管理',
    },
    name: 'WorkflowManagement',
    path: '/workflow',
    children: [
      {
        name: 'Workflow',
        path: '/workflow',
        component: () => import('#/views/workflow/index.vue'),
        meta: {
          icon: 'carbon:flow',
          title: '工作流列表',
        },
      },
      {
        name: 'WorkflowEdit',
        path: '/workflow/edit/:uuid',
        component: () => import('#/views/workflow/edit.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: false,
          title: '设计工作流',
          activePath: '/workflow',
        },
      },
      {
        name: 'WorkflowRun',
        path: '/workflow/run/:uuid',
        component: () => import('#/views/workflow/run.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: false,
          title: '运行工作流',
          activePath: '/workflow',
        },
      },
    ],
  },
];

export default routes;

