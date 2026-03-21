<script setup lang="ts">
import type { LeaveVO } from '../leave/api/model';

import { computed, onMounted, shallowRef } from 'vue';

import { Descriptions, DescriptionsItem, Skeleton } from 'ant-design-vue';
import dayjs from 'dayjs';

import { leaveInfo } from './api';
import { leaveTypeOptions } from './data';

defineOptions({
  name: 'LeaveDescription',
  inheritAttrs: false,
});

const props = defineProps<{ businessId: number | string }>();

const data = shallowRef<LeaveVO>();
onMounted(async () => {
  const resp = await leaveInfo(props.businessId);
  data.value = resp;
});

const leaveType = computed(() => {
  return (
    leaveTypeOptions.find((item) => item.value === data.value?.leaveType)
      ?.label ?? '未知'
  );
});

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD');
}
</script>

<template>
  <div class="rounded-[6px] border p-2">
    <Descriptions v-if="data" :column="1" size="middle">
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

    <Skeleton active v-else />
  </div>
</template>
