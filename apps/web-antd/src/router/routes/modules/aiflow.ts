import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
    },
    name: 'WorkflowEdit',
    path: '/aiflow/edit/:uuid',
    component: () => import('#/views/aiflow/edit.vue'),
  },
  {
    meta: {
      hideInMenu: true,
    },
    name: 'WorkflowRun',
    path: '/aiflow/run/:uuid',
    component: () => import('#/views/aiflow/run.vue'),
  },
];

export default routes;