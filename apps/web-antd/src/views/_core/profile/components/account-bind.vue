<script setup lang="tsx">
import type { BindItem } from '../../oauth-common';

import type { SocialInfo } from '#/api/system/social/model';

import { onMounted, ref } from 'vue';

import { Alert, Avatar, Card, Empty, Modal, Tooltip } from 'ant-design-vue';

import { authUnbinding } from '#/api';
import { socialList } from '#/api/system/social';

import { accountBindList, handleAuthBinding } from '../../oauth-common';

interface BindItemWithInfo extends BindItem {
  info?: SocialInfo;
  bind?: boolean;
}

const bindList = ref<BindItemWithInfo[]>([]);

async function loadData() {
  const resp = await socialList();

  const list: BindItemWithInfo[] = [...accountBindList];
  list.forEach((item) => {
    /**
     * 平台转小写
     */
    item.bound = resp
      .map((social) => social.source.toLowerCase())
      .includes(item.source.toLowerCase());
    /**
     * 添加info信息
     */
    if (item.bound) {
      item.info = resp.find(
        (social) => social.source.toLowerCase() === item.source,
      );
    }
  });
  bindList.value = list;
}
onMounted(loadData);

/**
 * 解绑账号
 */
function handleUnbind(record: BindItemWithInfo) {
  if (!record.info) {
    return;
  }
  Modal.confirm({
    content: `确定解绑[${record.source}]平台的[${record.info.userName}]账号吗？`,
    async onOk() {
      await authUnbinding(record.info!.id);
      await loadData();
    },
    title: '提示',
    type: 'warning',
  });
}

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
</script>

<template>
  <div class="flex flex-col gap-4 pb-4">
    <div
      v-if="bindList.length > 0"
      class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"
    >
      <Card
        class="transition-shadow duration-300 hover:shadow-md"
        v-for="item in bindList"
        :key="item.source"
      >
        <div class="flex w-full items-center gap-4">
          <component
            :is="item.avatar"
            v-if="item.avatar"
            :style="item?.style ?? {}"
            class="size-[40px]"
          />
          <div class="flex flex-1 items-center justify-between">
            <div class="flex flex-col">
              <h4 class="mb-[4px] text-[14px] text-black/85 dark:text-white/85">
                {{ item.title }}
              </h4>
              <span class="text-black/45 dark:text-white/45">
                <template v-if="!item.bound">
                  {{ item.description }}
                </template>
                <template v-if="item.bound && item.info">
                  <Tooltip>
                    <template #title>
                      <div class="flex flex-col items-center gap-2 p-2">
                        <Avatar :size="36" :src="item.info.avatar" />
                        <div>绑定时间: {{ item.info.createTime }}</div>
                      </div>
                    </template>
                    <div class="cursor-pointer">
                      已绑定: {{ item.info.nickName }}
                    </div>
                  </Tooltip>
                </template>
              </span>
            </div>
            <!-- TODO: 这里有优化空间? -->
            <a-button
              size="small"
              :type="item.bound ? 'default' : 'link'"
              @click="
                item.bound ? handleUnbind(item) : handleAuthBinding(item.source)
              "
            >
              {{ item.bound ? '取消绑定' : '绑定' }}
            </a-button>
          </div>
        </div>
      </Card>
    </div>
    <div
      v-if="bindList.length === 0"
      class="flex items-center justify-center rounded-lg border py-4"
    >
      <Empty :image="simpleImage" description="暂无可绑定的第三方账户" />
    </div>
    <Alert message="说明" type="info">
      <template #description>
        <p>
          需要添加第三方账号在
          <span class="font-bold">
            apps\web-antd\src\views\_core\oauth-common.ts
          </span>
          中accountBindList按模板添加
        </p>
      </template>
    </Alert>
  </div>
</template>

<style lang="scss" scoped>
/**
list item 间距
*/
:deep(.ant-list-item) {
  padding: 6px;
}
</style>
