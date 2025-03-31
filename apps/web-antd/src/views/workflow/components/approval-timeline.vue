<script setup lang="ts">
import type { Flow } from '#/api/workflow/instance/model';

import { Timeline } from 'ant-design-vue';

import ApprovalTimelineItem from './approval-timeline-item.vue';

const props = defineProps<{
  list: Flow[];
}>();
</script>

<template>
  <Timeline v-if="props.list.length > 0">
    <ApprovalTimelineItem
      v-for="item in props.list"
      :key="item.id"
      :item="item"
    />
  </Timeline>
</template>
