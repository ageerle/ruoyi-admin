<script setup lang="tsx">
import type { ColumnsType } from 'ant-design-vue/es/table';

import type { SocialInfo } from '#/api/system/social/model';

import { computed, onMounted, ref, unref } from 'vue';

import { createIconifyIcon } from '@vben/icons';

import {
  Alert,
  Avatar,
  Card,
  List,
  ListItem,
  message,
  Modal,
  Table,
} from 'ant-design-vue';

import { authUnbinding } from '#/api';
import { socialList } from '#/api/system/social';

import { accountBindList, type BindItem } from '../../oauth-common';

const columns: ColumnsType = [
  {
    align: 'center',
    dataIndex: 'source',
    title: '绑定平台',
  },
  {
    align: 'center',
    customRender: ({ value }) => {
      return <Avatar src={value} />;
    },
    dataIndex: 'avatar',
    title: '头像',
  },
  {
    align: 'center',
    dataIndex: 'userName',
    title: '账号',
  },
  {
    align: 'center',
    dataIndex: 'action',
    title: '操作',
  },
];

/**
 * 解绑账号
 */
function handleUnbind(record: Record<string, any>) {
  Modal.confirm({
    content: `确定解绑[${record.source}]平台的[${record.userName}]账号吗？`,
    async onOk() {
      await authUnbinding(record.id);
      await reload();
    },
    title: '提示',
    type: 'warning',
  });
}

/**
 * 没有传递action事件则不支持绑定 弹出默认提示
 */
function defaultTip(title: string) {
  message.info({ content: `暂不支持绑定${title}` });
}

function buttonText(item: BindItem) {
  return item.bound ? '已绑定' : '绑定';
}

/**
 * 已经绑定的平台
 */
const boundPlatformsList = ref<string[]>([]);
const bindList = computed<BindItem[]>(() => {
  const list = [...accountBindList];
  list.forEach((item) => {
    item.bound = !!unref(boundPlatformsList).includes(item.source);
  });
  return list;
});

const tableData = ref<SocialInfo[]>([]);

async function reload() {
  const resp = await socialList();
  /**
   * 平台转小写
   * 已经绑定的平台
   */
  boundPlatformsList.value = resp.map((item) => item.source.toLowerCase());
  tableData.value = resp;
}

onMounted(reload);
</script>

<template>
  <div class="flex flex-col gap-[16px]">
    <Table
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" @click="handleUnbind(record)">解绑</a-button>
        </template>
      </template>
    </Table>
    <div class="pb-3">
      <List
        :data-source="bindList"
        :grid="{ gutter: 8, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 3 }"
      >
        <template #renderItem="{ item }">
          <ListItem>
            <Card>
              <div class="flex w-full items-center gap-4">
                <div>
                  <component
                    :is="createIconifyIcon(item.avatar)"
                    v-if="item.avatar"
                    :style="{ color: item.color }"
                    class="size-[40px]"
                  />
                </div>
                <div class="flex flex-1 items-center justify-between">
                  <div class="flex flex-col">
                    <h4
                      class="mb-[4px] text-[14px] text-black/85 dark:text-white/85"
                    >
                      {{ item.title }}
                    </h4>
                    <span class="text-black/45 dark:text-white/45">
                      {{ item.description }}
                    </span>
                  </div>
                  <a-button
                    :disabled="item.bound"
                    size="small"
                    type="link"
                    @click="
                      item.action ? item.action() : defaultTip(item.title)
                    "
                  >
                    {{ buttonText(item) }}
                  </a-button>
                </div>
              </div>
            </Card>
          </ListItem>
        </template>
      </List>
      <Alert message="说明" type="info">
        <template #description>
          <p>
            需要添加第三方账号在
            <span class="font-bold">
              apps\web-antd\src\views\_core\oauth-common.ts
            </span>
            中accountBindList按模板添加
          </p>
          <p>
            添加对应模板后会在此处显示绑定, 但只有
            <span class="font-bold">实现了action才能在登录页显示</span>
          </p>
        </template>
      </Alert>
    </div>
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
