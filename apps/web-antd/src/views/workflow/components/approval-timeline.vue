<script setup lang="ts">
import type { Flow } from '#/api/workflow/instance/model';

import { Empty, Timeline } from 'ant-design-vue';

import ApprovalTimelineItem from './approval-timeline-item.vue';

interface Props {
  list: Flow[];
}

defineProps<Props>();
</script>

<template>
  <Timeline v-if="list.length > 0">
    <ApprovalTimelineItem v-for="item in list" :key="item.id" :item="item" />
  </Timeline>
  <Empty v-else />
</template>
