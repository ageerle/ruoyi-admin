<script setup lang="ts">
import { createIconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Col, Row, Tooltip } from 'ant-design-vue';

import { accountBindList } from '../oauth-common';

defineOptions({
  name: 'OAuthLogin',
});

/**
 * 有action方法才会显示
 */
const clientList = accountBindList.filter((item) => item.action);
</script>

<template>
  <div class="w-full sm:mx-auto md:max-w-md">
    <div class="mt-4 flex items-center justify-between">
      <span class="border-input w-[35%] border-b dark:border-gray-600"></span>
      <span class="text-muted-foreground text-center text-xs uppercase">
        {{ $t('authentication.thirdPartyLogin') }}
      </span>
      <span class="border-input w-[35%] border-b dark:border-gray-600"></span>
    </div>
    <Row class="enter-x flex items-center justify-evenly">
      <!-- todo 这里在点击登录时要disabled -->
      <Col v-for="item in clientList" :key="item.key" :span="4" class="my-2">
        <Tooltip :title="`${item.title}登录`">
          <span class="flex cursor-pointer items-center justify-center">
            <component
              :is="createIconifyIcon(item.avatar)"
              v-if="item.avatar"
              :style="{ color: item.color }"
              class="size-[24px]"
              @click="item.action"
            />
          </span>
        </Tooltip>
      </Col>
    </Row>
  </div>
</template>
