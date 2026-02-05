<!--
后端版本>=5.4.0  这个从本地路由变为从后台返回
未修改文件名 而是新加了这个文件
-->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useTabs } from '@vben/hooks';

import { Spin } from 'ant-design-vue';

import { useQueryId } from './hook';

const router = useRouter();
const route = useRoute();
const id = route.query.id as string;

/**
 * 从我的任务 -> 点击重新编辑会跳转到这里
 * 相当于一个中转 因为我的任务无法获取到列表页的路径(与ele交互不同)
 *
 * 为什么不使用路由的query来实现?
 * 因为刷新后参数不会丢失 且tab存的也是全路径 切换也不会丢失 这不符合预期
 * 可以通过window.history.replaceState来删除query参数 但是tab切换还是会保留
 */
const { closeCurrentTab } = useTabs();
const { businessId } = useQueryId();
onMounted(async () => {
  await closeCurrentTab();
  if (id) {
    // 设置业务ID 存储在内存
    businessId.value = id;
    router.push({ path: '/demo/leave' });
  }
});
</script>

<template>
  <div>
    <Spin :spinning="true" />
  </div>
</template>
