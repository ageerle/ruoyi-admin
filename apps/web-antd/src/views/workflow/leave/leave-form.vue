<!--
这个文件用不上  已经更改交互为drawer
-->

<script setup lang="ts">
import type { StartWorkFlowReqData } from '#/api/workflow/task/model';

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Card, Spin } from 'ant-design-vue';
import dayjs from 'dayjs';
import { cloneDeep, omit } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { startWorkFlow } from '#/api/workflow/task';

import { applyModal } from '../components';
import {
  leaveAdd,
  leaveInfo,
  leaveUpdate,
  submitAndStartWorkflow,
} from './api';
import { formSchema } from './data';

const route = useRoute();
const id = route.query?.id as string;

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    // 默认占满两列
    formItemClass: 'col-span-2',
    // 默认label宽度 px
    labelWidth: 100,
    // 通用配置项 会影响到所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  schema: formSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const loading = ref(false);
onMounted(async () => {
  // 只读 获取信息赋值
  if (id) {
    loading.value = true;

    const resp = await leaveInfo(id);
    await formApi.setValues(resp);
    const dateRange = [dayjs(resp.startDate), dayjs(resp.endDate)];
    await formApi.setFieldValue('dateRange', dateRange);

    loading.value = false;
  }
});

const router = useRouter();

/**
 * 获取已经处理好的表单参数
 */
async function getFormData() {
  let data = cloneDeep(await formApi.getValues()) as any;
  data = omit(data, 'flowType', 'type');
  // 处理日期
  data.startDate = dayjs(data.dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
  data.endDate = dayjs(data.dateRange[1]).format('YYYY-MM-DD HH:mm:ss');
  return data;
}

/**
 * 暂存/提交 提取通用逻辑
 */
async function handleSaveOrUpdate() {
  const data = await getFormData();
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
  loading.value = true;
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    // 获取发起类型
    const { type } = await formApi.getValues();
    /**
     * 这里只是demo 实际只会用到一种
     */
    switch (type) {
      // 后端发起流程
      case 'backend': {
        const data = await getFormData();
        await submitAndStartWorkflow(data);
        await handleCompleteOrCancel();
        break;
      }
      // 前端发起流程
      case 'frontend': {
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
          flowInstanceBizExtBo: {
            businessTitle: '请假申请 - 自定义标题',
            businessCode: leaveResp!.applyCode,
          },
        };
        const { taskId } = await startWorkFlow(startWorkFlowData);
        // 打开窗口
        applyModalApi.setData({
          taskId,
          taskVariables,
          variables: {},
        });
        applyModalApi.open();
        break;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

const { closeCurrentTab } = useTabs();

/**
 * 通用提交/取消回调
 *
 * 提交后点击取消 这时候已经变成草稿状态了
 * 每次点击都会生成新记录 直接跳转回列表
 */
async function handleCompleteOrCancel() {
  formApi.resetForm();
  await closeCurrentTab();
  router.push('/demo/leave');
}
</script>

<template>
  <Spin :spinning="loading">
    <Card>
      <BasicForm />
      <div class="flex justify-end gap-2">
        <a-button @click="handleTempSave">暂存</a-button>
        <a-button type="primary" @click="handleStartWorkFlow">提交</a-button>
      </div>
      <ApplyModal
        :modal-api="applyModalApi"
        @complete="handleCompleteOrCancel"
        @cancel="handleCompleteOrCancel"
      />
    </Card>
  </Spin>
</template>
