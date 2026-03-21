<script setup lang="ts">
import type { RedisInfo } from '#/api/monitor/cache';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';

interface IRedisInfo extends RedisInfo {
  dbSize: string;
}

defineProps<{ data: IRedisInfo }>();
</script>

<template>
  <Descriptions
    bordered
    :column="{ lg: 4, md: 3, sm: 1, xl: 4, xs: 1 }"
    size="small"
  >
    <DescriptionsItem label="redis版本">
      {{ data.redis_version }}
    </DescriptionsItem>
    <DescriptionsItem label="redis模式">
      {{ data.redis_mode === 'standalone' ? '单机模式' : '集群模式' }}
    </DescriptionsItem>
    <DescriptionsItem label="tcp端口">
      {{ data.tcp_port }}
    </DescriptionsItem>
    <DescriptionsItem label="客户端数">
      {{ data.connected_clients }}
    </DescriptionsItem>
    <DescriptionsItem label="运行时间">
      {{ data.uptime_in_days }} 天
    </DescriptionsItem>
    <DescriptionsItem label="使用内存">
      {{ data.used_memory_human }}
    </DescriptionsItem>
    <DescriptionsItem label="使用CPU">
      {{ Number.parseFloat(data?.used_cpu_user_children ?? '0').toFixed(2) }}
    </DescriptionsItem>
    <DescriptionsItem label="内存配置">
      {{ data.maxmemory_human }}
    </DescriptionsItem>
    <DescriptionsItem label="AOF是否开启">
      {{ data.aof_enabled === '0' ? '否' : '是' }}
    </DescriptionsItem>
    <DescriptionsItem label="RDB是否成功">
      {{ data.rdb_last_bgsave_status }}
    </DescriptionsItem>
    <DescriptionsItem label="key数量">
      {{ data.dbSize }}
    </DescriptionsItem>
    <DescriptionsItem label="网络入口/出口">
      {{
        `${data.instantaneous_input_kbps}kps/${data.instantaneous_output_kbps}kps`
      }}
    </DescriptionsItem>
  </Descriptions>
</template>
