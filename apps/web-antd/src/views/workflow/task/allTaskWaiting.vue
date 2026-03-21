<!-- eslint-disable no-use-before-define -->
<script setup lang="ts">
import type { User } from '#/api/system/user/model';
import type { TaskInfo } from '#/api/workflow/task/model';

import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { addFullName, getPopupContainer } from '@vben/utils';

import { FilterOutlined, RedoOutlined } from '@ant-design/icons-vue';
import {
  Empty,
  Form,
  FormItem,
  Input,
  InputSearch,
  Popover,
  Segmented,
  Spin,
  Tooltip,
  TreeSelect,
} from 'ant-design-vue';
import { cloneDeep, debounce, uniqueId } from 'lodash-es';

import { categoryTree } from '#/api/workflow/category';
import { pageByAllTaskFinish, pageByAllTaskWait } from '#/api/workflow/task';

import { ApprovalCard, ApprovalPanel, CopyComponent } from '../components';
import { bottomOffset } from './constant';

const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE;

/**
 * 流程监控 - 待办任务页面的id不唯一 改为前端处理
 */
interface TaskItem extends TaskInfo {
  active: boolean;
  randomId: string;
}

const taskList = ref<TaskItem[]>([]);
const taskTotal = ref(0);
const page = ref(1);
const loading = ref(false);

const typeOptions = [
  { label: '待办任务', value: 'todo' },
  { label: '已办任务', value: 'done' },
];
const currentType = ref('todo');
const currentApi = computed(() => {
  if (currentType.value === 'todo') {
    return pageByAllTaskWait;
  }
  return pageByAllTaskFinish;
});
const approvalType = computed(() => {
  if (currentType.value === 'done') {
    return 'readonly';
  }
  return 'admin';
});
async function handleTypeChange() {
  // 需要先滚动到顶部
  cardContainerRef.value?.scroll({ top: 0, behavior: 'auto' });
  page.value = 1;

  taskList.value = [];
  await nextTick();
  await reload(true);
}

const defaultFormData = {
  flowName: '', // 流程定义名称
  nodeName: '', // 任务名称
  flowCode: '', // 流程定义编码
  createByIds: [] as string[], // 创建人
  category: null as null | number, // 流程分类
};
const formData = ref(cloneDeep(defaultFormData));

/**
 * 是否已经加载全部数据 即 taskList.length === taskTotal
 */
const isLoadComplete = computed(
  () => taskList.value.length === taskTotal.value,
);

// 卡片父容器的ref
const cardContainerRef = useTemplateRef('cardContainerRef');

/**
 * @param resetFields 是否清空查询参数
 */
async function reload(resetFields: boolean = false) {
  // 需要先滚动到顶部
  cardContainerRef.value?.scroll({ top: 0, behavior: 'auto' });

  page.value = 1;
  currentTask.value = undefined;
  taskTotal.value = 0;
  lastSelectId.value = '';

  if (resetFields) {
    formData.value = cloneDeep(defaultFormData);
    selectedUserList.value = [];
  }

  loading.value = true;
  const resp = await currentApi.value({
    pageSize: 10,
    pageNum: page.value,
    ...formData.value,
  });
  taskList.value = resp.rows.map((item) => ({
    ...item,
    active: false,
    randomId: uniqueId(),
  }));
  taskTotal.value = resp.total;

  loading.value = false;
  // 默认选中第一个
  if (taskList.value.length > 0) {
    const firstTask = taskList.value[0]!;
    currentTask.value = firstTask;
    handleCardClick(firstTask);
  }
}

onMounted(reload);

const handleScroll = debounce(async (e: Event) => {
  if (!e.target) {
    return;
  }
  // e.target.scrollTop 是元素顶部到当前可视区域顶部的距离，即已滚动的高度。
  // e.target.clientHeight 是元素的可视高度。
  // e.target.scrollHeight 是元素的总高度。
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLElement;
  // 判断是否滚动到底部
  const isBottom = scrollTop + clientHeight >= scrollHeight - bottomOffset;
  console.log('scrollTop + clientHeight', scrollTop + clientHeight);
  console.log('scrollHeight', scrollHeight);

  // 滚动到底部且没有加载完成
  if (isBottom && !isLoadComplete.value) {
    loading.value = true;
    page.value += 1;
    const resp = await currentApi.value({
      pageSize: 10,
      pageNum: page.value,
      ...formData.value,
    });
    taskList.value.push(
      ...resp.rows.map((item) => ({
        ...item,
        active: false,
        randomId: uniqueId(),
      })),
    );
    loading.value = false;
  }
}, 200);

const lastSelectId = ref('');
const currentTask = ref<TaskInfo>();
async function handleCardClick(item: TaskItem) {
  const { randomId } = item;
  // 点击的是同一个
  if (lastSelectId.value === randomId) {
    return;
  }
  currentTask.value = item;
  // 反选状态 & 如果已经点击了 不变 & 保持只能有一个选中
  taskList.value.forEach((item) => {
    item.active = item.randomId === randomId;
  });
  lastSelectId.value = randomId;
}

const { refreshTab } = useTabs();

// 由于失去焦点浮层会消失 使用v-model选择人员完毕后强制显示
const popoverOpen = ref(false);
const selectedUserList = ref<User[]>([]);
function handleFinish(userList: User[]) {
  popoverOpen.value = true;
  selectedUserList.value = userList;
  formData.value.createByIds = userList.map((item) => item.userId);
}

const treeData = ref<any[]>([]);
onMounted(async () => {
  // menu
  const tree = await categoryTree();
  addFullName(tree, 'label', ' / ');
  treeData.value = tree;
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full gap-2">
      <div
        class="bg-background relative flex h-full min-w-[320px] max-w-[320px] flex-col rounded-lg"
      >
        <!-- 搜索条件 -->
        <div
          class="bg-background z-100 sticky left-0 top-0 w-full rounded-t-lg border-b-[1px] border-solid p-2"
        >
          <Segmented
            v-model:value="currentType"
            :options="typeOptions"
            block
            class="mb-2"
            @change="handleTypeChange"
          />
          <div class="flex items-center gap-1">
            <InputSearch
              v-model:value="formData.flowName"
              placeholder="流程名称搜索"
              @search="reload(false)"
            />
            <Tooltip placement="top" title="重置">
              <a-button @click="reload(true)">
                <RedoOutlined />
              </a-button>
            </Tooltip>
            <Popover
              v-model:open="popoverOpen"
              :get-popup-container="getPopupContainer"
              placement="rightTop"
              trigger="click"
            >
              <template #title>
                <div class="w-full border-b pb-[12px] text-[16px]">搜索</div>
              </template>
              <template #content>
                <Form
                  :colon="false"
                  :label-col="{ span: 6 }"
                  :model="formData"
                  autocomplete="off"
                  class="w-[300px]"
                  @finish="() => reload(false)"
                >
                  <FormItem label="申请人">
                    <!-- 弹窗关闭后仍然显示表单浮层 -->
                    <CopyComponent
                      v-model:user-list="selectedUserList"
                      @cancel="() => (popoverOpen = true)"
                      @finish="handleFinish"
                    />
                  </FormItem>
                  <FormItem label="流程分类">
                    <TreeSelect
                      v-model:value="formData.category"
                      :allow-clear="true"
                      :field-names="{ label: 'label', value: 'id' }"
                      :get-popup-container="getPopupContainer"
                      :tree-data="treeData"
                      :tree-default-expand-all="true"
                      :tree-line="{ showLeafIcon: false }"
                      placeholder="请选择"
                      tree-node-filter-prop="label"
                      tree-node-label-prop="fullName"
                    />
                  </FormItem>
                  <FormItem label="任务名称">
                    <Input
                      v-model:value="formData.nodeName"
                      placeholder="请输入"
                    />
                  </FormItem>
                  <FormItem label="流程编码">
                    <Input
                      v-model:value="formData.flowCode"
                      placeholder="请输入"
                    />
                  </FormItem>
                  <FormItem>
                    <div class="flex">
                      <a-button block html-type="submit" type="primary">
                        搜索
                      </a-button>
                      <a-button block class="ml-2" @click="reload(true)">
                        重置
                      </a-button>
                    </div>
                  </FormItem>
                </Form>
              </template>
              <a-button>
                <FilterOutlined />
              </a-button>
            </Popover>
          </div>
        </div>
        <div
          ref="cardContainerRef"
          class="thin-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto py-3"
          @scroll="handleScroll"
        >
          <template v-if="taskList.length > 0">
            <ApprovalCard
              v-for="item in taskList"
              :key="item.randomId"
              :info="item"
              class="mx-2"
              row-key="randomId"
              @click="handleCardClick(item)"
            />
          </template>
          <Empty v-else :image="emptyImage" />
          <div
            v-if="isLoadComplete && taskList.length > 0"
            class="flex items-center justify-center text-[14px] opacity-50"
          >
            没有更多数据了
          </div>
          <!-- 遮罩loading层 -->
          <div
            v-if="loading"
            class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.1)]"
          >
            <Spin tip="加载中..." />
          </div>
        </div>
        <!-- total显示 -->
        <div
          class="bg-background sticky bottom-0 w-full rounded-b-lg border-t-[1px] py-2"
        >
          <div class="flex items-center justify-center">
            共 {{ taskTotal }} 条记录
          </div>
        </div>
      </div>
      <ApprovalPanel
        :task="currentTask"
        :type="approvalType"
        @reload="refreshTab"
      />
    </div>
  </Page>
</template>

<style lang="scss" scoped>
.thin-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }
}

:deep(.ant-card-body) {
  @apply thin-scrollbar;
}
</style>
