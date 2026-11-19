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
    path: '/knowledge/info/detail',
    children: [
      {
        alias: '/chat/attach',
        component: () => import('#/views/knowledge/attach/index.vue'),
        meta: { hideInMenu: true, title: '知识附件' },
        name: 'LegacyKnowledgeAttach',
        path: '/knowledge/attach',
      },
      {
        alias: '/chat/fragment',
        component: () => import('#/views/knowledge/fragment/index.vue'),
        meta: { hideInMenu: true, title: '知识片段' },
        name: 'LegacyKnowledgeFragment',
        path: '/knowledge/fragment',
      },
      {
        name: 'KnowledgeInfoDetail',
        path: ':id',
        component: () => import('#/views/knowledge/info/detail/index.vue'),
        meta: {
          activePath: '/knowledge/info',
          fullPathKey: false,
          title: '知识库详情',
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
