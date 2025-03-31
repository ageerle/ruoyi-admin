<script setup lang="ts">
import type { LeaveVO } from './api/model';

import { computed } from 'vue';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';
import dayjs from 'dayjs';

import { leaveTypeOptions } from './data';

defineOptions({
  name: 'LeaveDescription',
  inheritAttrs: false,
});

const props = defineProps<{ data: LeaveVO }>();

const leaveType = computed(() => {
  return (
    leaveTypeOptions.find((item) => item.value === props.data.leaveType)
      ?.label ?? '未知'
  );
});

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}
</script>

<template>
  <Descriptions :column="1" size="middle">
    <DescriptionsItem label="请假类型">
      {{ leaveType }}
    </DescriptionsItem>
    <DescriptionsItem label="请假时间">
      {{ formatDate(data.startDate) }} - {{ formatDate(data.endDate) }}
    </DescriptionsItem>
    <DescriptionsItem label="请假时长">
      {{ data.leaveDays }}天
    </DescriptionsItem>
    <DescriptionsItem label="请假原因">
      {{ data.remark || '无' }}
    </DescriptionsItem>
  </Descriptions>
</template>
