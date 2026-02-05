<script setup lang="ts">
import type { CheckboxChangeEvent } from 'ant-design-vue/es/checkbox/interface';
import type { DataNode } from 'ant-design-vue/es/tree';

import { computed, nextTick, onMounted, ref } from 'vue';

import { treeToList } from '@vben/utils';

import { Checkbox, Tree } from 'ant-design-vue';

/** 需要禁止透传 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  expandAllOnInit: false,
  fieldNames: () => ({ key: 'id', title: 'label' }),
  resetOnStrictlyChange: true,
  treeData: () => [],
});

interface Props {
  /**
   * 是否展开所有节点 mount
   */
  expandAllOnInit?: boolean;
  /**
   * 自定义字段
   */
  fieldNames?: { key: string; title: string };
  /**
   * 点击节点关联/独立时 清空已勾选的节点
   */
  resetOnStrictlyChange?: boolean;
  /**
   * 树结构数据
   */
  treeData?: DataNode[];
}

/**
 * 展开的状态
 */
const expandStatus = ref(false);
/**
 * 全选状态
 */
const selectAllStatus = ref(false);

const associationText = computed(() => {
  return checkStrictly.value ? '父子节点关联' : '父子节点独立';
});

/**
 * 这个只用于界面显示
 * 关联情况下 只会有最末尾的节点被选中
 */
const checkedKeys = defineModel<(number | string)[]>('value', {
  default: () => [],
});

/**
 * 是否节点关联 后端字段跟前端字段是反的
 */
const checkStrictly = defineModel<boolean>('checkStrictly', {
  default: () => true,
});

const computedCheckedKeys = computed<any>({
  get() {
    /**
     * 严格模式(节点不关联)  需要返回{checked: string[] | number[], halfChecked: string[]}
     * @see https://www.antdv.com/components/tree-cn#tree-props
     */
    if (!checkStrictly.value) {
      return {
        checked: [...checkedKeys.value],
        halfChecked: [],
      };
    }
    return checkedKeys.value;
  },
  set(v) {
    if (!checkStrictly.value) {
      checkedKeys.value = [...v.checked, ...v.halfChecked];
      return;
    }
    checkedKeys.value = v;
  },
});

// 所有节点的ID
const allKeys = computed(() => {
  const idField = props.fieldNames.key;
  return treeToList(props.treeData).map((item: any) => item[idField]);
});

function handleCheckedAllChange(e: CheckboxChangeEvent) {
  // 这个用于展示
  checkedKeys.value = e.target.checked ? allKeys.value : [];
}

const expandedKeys = ref<string[]>([]);
function handleExpandOrCollapseAll() {
  expandStatus.value = !expandStatus.value;
  expandedKeys.value = expandStatus.value ? allKeys.value : [];
}

function handleCheckStrictlyChange() {
  if (props.resetOnStrictlyChange) {
    checkedKeys.value = [];
  }
}

onMounted(async () => {
  if (props.expandAllOnInit) {
    await nextTick();
    expandedKeys.value = allKeys.value;
  }
});
</script>

<template>
  <div class="bg-background w-full rounded-lg border-[1px] p-[12px]">
    <!-- <div class="flex flex-col gap-6 text-[13px]">
      <div>computedCheckedKeys {{ computedCheckedKeys }}</div>
      <div>checkedKeys {{ checkedKeys }}</div>
    </div> -->

    <div class="flex items-center justify-between gap-2 border-b-[1px] pb-2">
      <div class="opacity-75">
        <span>节点状态: </span>
        <span :class="[checkStrictly ? 'text-primary' : 'text-red-500']">
          {{ associationText }}
        </span>
      </div>
    </div>
    <div
      class="flex flex-wrap items-center justify-between border-b-[1px] py-2"
    >
      <a-button size="small" @click="handleExpandOrCollapseAll">
        展开/折叠全部
      </a-button>
      <Checkbox
        v-model:checked="selectAllStatus"
        @change="handleCheckedAllChange"
      >
        全选/取消全选
      </Checkbox>
      <Checkbox
        v-model:checked="checkStrictly"
        @change="handleCheckStrictlyChange"
      >
        父子节点关联
      </Checkbox>
    </div>
    <div class="py-2">
      <Tree
        :check-strictly="!checkStrictly"
        v-model:checked-keys="computedCheckedKeys"
        v-model:expanded-keys="expandedKeys"
        :checkable="true"
        :field-names="fieldNames"
        :selectable="false"
        :tree-data="treeData"
      >
        <template
          v-for="slotName in Object.keys($slots)"
          :key="slotName"
          #[slotName]="data"
        >
          <slot :name="slotName" v-bind="data ?? {}"></slot>
        </template>
      </Tree>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.ant-tree) {
  // 勾选框居中
  & .ant-tree-checkbox {
    margin: 0;
    margin-right: 6px;
  }

  // 展开图标居中
  & .ant-tree-switcher {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
