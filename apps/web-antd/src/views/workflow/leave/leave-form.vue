<script setup lang="ts">
import type { LeaveVO } from './api/model';

import type { StartWorkFlowReqData } from '#/api/workflow/task/model';

import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { Card } from 'ant-design-vue';
import dayjs from 'dayjs';
import { cloneDeep, omit } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { startWorkFlow } from '#/api/workflow/task';

import { applyModal } from '../components';
import { leaveAdd, leaveInfo, leaveUpdate } from './api';
import { modalSchema } from './data';
import LeaveDescription from './leave-description.vue';

const route = useRoute();
const readonly = route.query?.readonly === 'true';
const id = route.query?.id as string;

/**
 * id存在&readonly时候
 */
const showActionBtn = computed(() => {
  return !readonly;
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    // 默认占满两列
    formItemClass: 'col-span-2',
    // 默认label宽度 px
    labelWidth: 100,
    // 通用配置项 会影响到所有表单项
    componentProps: {
      class: 'w-full',
      disabled: readonly,
    },
  },
  schema: modalSchema(!readonly),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const leaveDescription = ref<LeaveVO>();
const showDescription = computed(() => {
  return readonly && leaveDescription.value;
});
const cardRef = useTemplateRef('cardRef');
onMounted(async () => {
  // 只读 获取信息赋值
  if (id) {
    const resp = await leaveInfo(id);
    leaveDescription.value = resp;
    await formApi.setValues(resp);
    const dateRange = [dayjs(resp.startDate), dayjs(resp.endDate)];
    await formApi.setFieldValue('dateRange', dateRange);

    /**
     * window.parent（最近的上一级父页面）
     * 主要解决内嵌iframe卡顿的问题
     */
    if (readonly) {
      // 渲染完毕才显示表单
      window.parent.postMessage({ type: 'mounted' }, '*');
      // 获取表单高度 内嵌时保持一致
      setTimeout(() => {
        const el = cardRef.value?.$el as HTMLDivElement;
        // 获取高度
        const height = el?.offsetHeight ?? 0;
        if (height) {
          window.parent.postMessage({ type: 'height', height }, '*');
        }
      });
    }
  }
});

const router = useRouter();

/**
 * 提取通用逻辑
 */
async function handleSaveOrUpdate() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  let data = cloneDeep(await formApi.getValues()) as any;
  data = omit(data, 'flowType');
  // 处理日期
  data.startDate = dayjs(data.dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
  data.endDate = dayjs(data.dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
  if (id) {
    data.id = id;
    return await leaveUpdate(data);
  } else {
    return await leaveAdd(data);
  }
}

const [ApplyModal, applyModalApi] = useVbenModal({
  connectedComponent: applyModal,
});
/**
 * 暂存 草稿状态
 */
async function handleTempSave() {
  try {
    await handleSaveOrUpdate();
    router.push('/demo/leave');
  } catch (error) {
    console.error(error);
  }
}

/**
 * 保存业务 & 发起流程
 */
async function handleStartWorkFlow() {
  try {
    // 保存业务
    const leaveResp = await handleSaveOrUpdate();
    // 启动流程
    const taskVariables = {
      leaveDays: leaveResp!.leaveDays,
      userList: ['1', '3', '4'],
    };
    const formValues = await formApi.getValues();
    const flowCode = formValues?.flowType ?? 'leave1';
    const startWorkFlowData: StartWorkFlowReqData = {
      businessId: leaveResp!.id,
      flowCode,
      variables: taskVariables,
    };
    const { taskId } = await startWorkFlow(startWorkFlowData);
    // 打开窗口
    applyModalApi.setData({
      taskId,
      taskVariables,
      variables: {},
    });
    applyModalApi.open();
  } catch (error) {
    console.error(error);
  }
}

function handleComplete() {
  formApi.resetForm();
  router.push('/demo/leave');
}

/**
 * 显示详情时 需要较小的padding
 */
const cardSize = computed(() => {
  return showDescription.value ? 'small' : 'default';
});
</script>

<template>
  <Card ref="cardRef" :size="cardSize">
    <div id="leave-form">
      <!-- 使用v-if会影响生命周期 -->
      <BasicForm v-show="!showDescription" />
      <LeaveDescription v-if="showDescription" :data="leaveDescription!" />
      <div v-if="showActionBtn" class="flex justify-end gap-2">
        <a-button @click="handleTempSave">暂存</a-button>
        <a-button type="primary" @click="handleStartWorkFlow">提交</a-button>
      </div>
      <ApplyModal @complete="handleComplete" />
    </div>
  </Card>
</template>

<style lang="scss">
html:has(#leave-form) {
  /**
  去除顶部进度条样式
  */
  #nprogress {
    display: none;
  }
}
</style>
