<script setup lang="ts">
import type { OperationLog } from '#/api/monitor/operlog/model';

import { computed, shallowRef } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { DictEnum } from '@vben/constants';

import { Descriptions, DescriptionsItem, Tag } from 'ant-design-vue';

import {
  renderDict,
  renderHttpMethodTag,
  renderJsonPreview,
} from '#/utils/render';

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onOpenChange: handleOpenChange,
  onClosed() {
    currentLog.value = null;
  },
});

const currentLog = shallowRef<null | OperationLog>(null);
function handleOpenChange(open: boolean) {
  if (!open) {
    return null;
  }
  const { record } = drawerApi.getData() as { record: OperationLog };
  currentLog.value = record;
}

const actionInfo = computed(() => {
  if (!currentLog.value) {
    return '-';
  }
  const data = currentLog.value;
  return `账号: ${data.operName} / ${data.deptName} / ${data.operIp} / ${data.operLocation}`;
});
</script>

<template>
  <BasicDrawer :footer="false" class="w-[600px]" title="查看日志">
    <Descriptions v-if="currentLog" size="small" bordered :column="1">
      <DescriptionsItem label="日志编号" :label-style="{ minWidth: '120px' }">
        {{ currentLog.operId }}
      </DescriptionsItem>
      <DescriptionsItem label="操作结果">
        <component
          :is="renderDict(currentLog.status, DictEnum.SYS_COMMON_STATUS)"
        />
      </DescriptionsItem>
      <DescriptionsItem label="操作模块">
        <div class="flex items-center">
          <Tag>{{ currentLog.title }}</Tag>
          <component
            :is="renderDict(currentLog.businessType, DictEnum.SYS_OPER_TYPE)"
          />
        </div>
      </DescriptionsItem>
      <DescriptionsItem label="操作信息">
        {{ actionInfo }}
      </DescriptionsItem>
      <DescriptionsItem label="请求信息">
        <component :is="renderHttpMethodTag(currentLog.requestMethod)" />
        {{ currentLog.operUrl }}
      </DescriptionsItem>
      <DescriptionsItem v-if="currentLog.errorMsg" label="异常信息">
        <span class="font-semibold text-red-600">
          {{ currentLog.errorMsg }}
        </span>
      </DescriptionsItem>
      <DescriptionsItem label="方法">
        {{ currentLog.method }}
      </DescriptionsItem>
      <DescriptionsItem label="请求参数">
        <div class="max-h-[300px] overflow-y-auto">
          <component :is="renderJsonPreview(currentLog.operParam)" />
        </div>
      </DescriptionsItem>
      <DescriptionsItem v-if="currentLog.jsonResult" label="响应参数">
        <div class="max-h-[300px] overflow-y-auto">
          <component :is="renderJsonPreview(currentLog.jsonResult)" />
        </div>
      </DescriptionsItem>
      <DescriptionsItem label="请求耗时">
        {{ `${currentLog.costTime} ms` }}
      </DescriptionsItem>
      <DescriptionsItem label="操作时间">
        {{ `${currentLog.operTime}` }}
      </DescriptionsItem>
    </Descriptions>
  </BasicDrawer>
</template>
