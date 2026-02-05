import { defineAsyncComponent, markRaw } from 'vue';

/**
 * 这里定义流程描述组件
 */

const LeaveDescription = defineAsyncComponent(
  () => import('#/views/workflow/leave/leave-description.vue'),
);

/**
 * key为流程的路径(task.formPath) value为要显示的组件
 */
export const flowComponentsMap = {
  /**
   * 请假申请 详情
   */
  '/workflow/leaveEdit/index': markRaw(LeaveDescription),
};

export type FlowComponentsMapMapKey = keyof typeof flowComponentsMap;
