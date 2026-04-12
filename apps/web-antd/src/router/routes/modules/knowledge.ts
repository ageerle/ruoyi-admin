import type { RouteRecordRaw } from 'vue-router';

const BasicLayout = () => import('#/layouts/basic.vue');

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      hideInBreadcrumb: true,
      title: 'Knowledge Base',
      hideInMenu: true,
    },
    name: 'KnowledgeBaseRoot',
    path: '/knowledge',
    children: [
      {
        name: 'KnowledgeInfoDetail',
        path: 'info/detail/:id',
        component: () => import('#/views/knowledge/info/detail/index.vue'),
        meta: {
          title: '知识库详情',
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
