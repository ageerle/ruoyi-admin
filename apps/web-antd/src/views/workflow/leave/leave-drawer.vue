<script setup lang="ts">
import type { ExtendedModalApi } from '@vben/common-ui';

import type { StartWorkFlowReqData } from '#/api/workflow/task/model';

import { computed, ref, shallowRef } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import dayjs from 'dayjs';
import { omit } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { startWorkFlow } from '#/api/workflow/task';

import {
  leaveAdd,
  leaveInfo,
  leaveUpdate,
  submitAndStartWorkflow,
} from './api';
import { formSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  layout: 'vertical',
  commonConfig: {
    formItemClass: 'col-span-2',
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 100,
  },
  schema: formSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const modalApi = shallowRef<ExtendedModalApi | null>(null);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  closeOnClickModal: false,
  onClosed: handleClosed,
  onConfirm: handleStartWorkFlow,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);

    const { id, applyModalApi } = drawerApi.getData() as {
      applyModalApi: ExtendedModalApi;
      id?: number | string;
    };
    modalApi.value = applyModalApi;
    isUpdate.value = !!id;
    // 赋值
    if (isUpdate.value && id) {
      const resp = await leaveInfo(id);
      await formApi.setValues(resp);
      const dateRange = [dayjs(resp.startDate), dayjs(resp.endDate)];
      await formApi.setFieldValue('dateRange', dateRange);
    }

    drawerApi.drawerLoading(false);
  },
});

async function handleClosed() {
  await formApi.resetForm();
}

/**
 * 获取已经处理好的表单参数
 */
async function getFormData() {
  const { valid } = await formApi.validate();
  if (!valid) {
    throw new Error('表单验证失败');
  }
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
  return await (isUpdate.value ? leaveUpdate(data) : leaveAdd(data));
}

/**
 * 暂存 草稿状态
 */
async function handleTempSave() {
  try {
    await handleSaveOrUpdate();
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  }
}

/**
 * 保存业务 & 发起流程
 */
async function handleStartWorkFlow() {
  drawerApi.lock(true);
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
        emit('reload');
        drawerApi.close();
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
        modalApi.value?.setData({
          taskId,
          taskVariables,
          variables: {},
        });
        modalApi.value?.open();
        break;
      }
    }
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <BasicForm />
    <template #center-footer>
      <a-button @click="handleTempSave">暂存</a-button>
    </template>
  </BasicDrawer>
</template>
