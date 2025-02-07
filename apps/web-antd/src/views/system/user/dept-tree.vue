<script setup lang="ts">
import type { DeptTree } from '#/api/system/user/model';

import { onMounted, type PropType, ref } from 'vue';

import { Empty, Skeleton, Tree } from 'ant-design-vue';

import { getDeptTree } from '#/api/system/user';

defineOptions({ inheritAttrs: false });

defineEmits<{ select: [] }>();

const selectDeptId = defineModel('selectDeptId', {
  required: true,
  type: Array as PropType<string[]>,
});

/** 部门数据源 */
type DeptTreeArray = DeptTree[];
const deptTreeArray = ref<DeptTreeArray>([]);
/** 骨架屏加载 */
const showTreeSkeleton = ref<boolean>(true);

onMounted(async () => {
  const ret = await getDeptTree();
  deptTreeArray.value = ret;
  showTreeSkeleton.value = false;
});
</script>

<template>
  <Skeleton :loading="showTreeSkeleton" :paragraph="{ rows: 8 }" active>
    <Tree
      v-bind="$attrs"
      v-if="deptTreeArray.length > 0"
      v-model:selected-keys="selectDeptId"
      :class="$attrs.class"
      :field-names="{ title: 'label', key: 'id' }"
      :show-line="{ showLeafIcon: false }"
      :tree-data="deptTreeArray"
      class="p-[8px]"
      default-expand-all
      @select="$emit('select')"
    />
    <!-- 仅本人数据权限 可以考虑直接不显示 -->
    <div v-else class="mt-5">
      <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="无部门数据" />
    </div>
  </Skeleton>
</template>
