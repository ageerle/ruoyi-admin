<script setup lang="ts">
import type { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface';
import type { DataNode } from 'ant-design-vue/es/tree';
import type { CheckInfo } from 'ant-design-vue/es/vc-tree/props';

import { computed, type PropType, ref, watch } from 'vue';

import { findGroupParentIds, treeToList } from '@vben/utils';

import { Checkbox, Tree } from 'ant-design-vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  checkStrictly: {
    default: true,
    type: Boolean,
  },
  menuTree: {
    default: () => [],
    type: Array as PropType<DataNode[]>,
  },
});
const emit = defineEmits<{ checkStrictlyChange: [boolean] }>();

const expandStatus = ref(false);
const selectAllStatus = ref(false);

/**
 * 后台的这个字段跟antd/ele是反的
 * 组件库这个字段代表不关联
 * 后台这个代表关联
 */
const innerCheckedStrictly = computed(() => {
  return !props.checkStrictly;
});

function handleCheckStrictlyChange(e: CheckboxChangeEvent) {
  emit('checkStrictlyChange', e.target.checked);
}

const associationText = computed(() => {
  return props.checkStrictly ? '父子节点关联' : '父子节点独立';
});

/**
 * 这个只用于界面显示
 * 关联情况下 只会有最末尾的节点被选中
 */
const checkedKeys = defineModel('value', {
  default: () => [],
  type: Array as PropType<(number | string)[]>,
});
// 所有节点的ID
const allKeys = computed(() => {
  return treeToList(props.menuTree).map((item: any) => item.id);
});

/** 已经选择的所有节点  包括子/父节点 */
const checkedMenuKeys = ref<(number | string)[]>([]);

/**
 * 取第一次的menuTree id 设置到checkedMenuKeys
 * 主要为了解决没有任何修改 直接点击保存的情况
 */
const stop = watch(
  () => props.menuTree,
  () => {
    /** 节点关联情况下是不带父节点的 */
    if (props.checkStrictly) {
      /** 找到父节点 添加上 */
      const parentIds = findGroupParentIds(
        props.menuTree,
        checkedKeys.value as any,
      );
      checkedMenuKeys.value = [...parentIds, ...checkedKeys.value];
    } else {
      /** 节点独立 这里是全部的节点 */
      checkedMenuKeys.value = checkedKeys.value;
    }
    stop();
  },
);

/**
 *
 * @param checkedKeys 已经选中的子节点的ID
 * @param info info.halfCheckedKeys为父节点的ID
 */
type CheckedState<T = number | string> =
  | { checked: T[]; halfChecked: T[] }
  | T[];
function handleChecked(checkedKeys: CheckedState, info: CheckInfo) {
  // 数组的话为节点关联
  if (Array.isArray(checkedKeys)) {
    const halfCheckedKeys: number[] = (info.halfCheckedKeys || []) as number[];
    checkedMenuKeys.value = [...halfCheckedKeys, ...checkedKeys];
  } else {
    checkedMenuKeys.value = [...checkedKeys.checked];
  }
}

function handleExpandChange(e: CheckboxChangeEvent) {
  // 这个用于展示
  checkedKeys.value = e.target.checked ? allKeys.value : [];
  // 这个用于提交
  checkedMenuKeys.value = e.target.checked ? allKeys.value : [];
}

const expandedKeys = ref<string[]>([]);
function handleExpandOrCollapseAll(e: CheckboxChangeEvent) {
  const expand = e.target.checked;
  expandedKeys.value = expand ? allKeys.value : [];
}

defineExpose({
  getCheckedKeys: () => checkedMenuKeys.value,
});
</script>

<template>
  <div class="bg-background w-full rounded-lg border-[1px] p-[12px]">
    <div class="flex items-center gap-2 border-b-[1px] pb-2">
      <span>节点状态: </span>
      <span
        :class="[props.checkStrictly ? 'text-primary' : 'text-red-500']"
        class="font-semibold"
      >
        {{ associationText }}
      </span>
    </div>
    <div
      class="flex flex-wrap items-center justify-between border-b-[1px] py-2"
    >
      <Checkbox
        v-model:checked="expandStatus"
        @change="handleExpandOrCollapseAll"
      >
        展开/折叠全部
      </Checkbox>
      <Checkbox v-model:checked="selectAllStatus" @change="handleExpandChange">
        全选/取消全选
      </Checkbox>
      <Checkbox :checked="checkStrictly" @change="handleCheckStrictlyChange">
        父子节点关联
      </Checkbox>
    </div>
    <div class="py-2">
      <Tree
        v-if="menuTree.length > 0"
        v-model:check-strictly="innerCheckedStrictly"
        v-model:checked-keys="checkedKeys"
        v-model:expanded-keys="expandedKeys"
        :checkable="true"
        :field-names="{ title: 'label', key: 'id' }"
        :selectable="false"
        :tree-data="menuTree"
        @check="handleChecked"
      />
    </div>
  </div>
</template>
