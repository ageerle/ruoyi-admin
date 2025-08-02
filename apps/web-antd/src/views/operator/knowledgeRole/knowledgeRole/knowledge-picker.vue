<script setup lang="ts">

import { onMounted, ref, type PropType } from 'vue';
import { Select, } from 'ant-design-vue';
import type { SelectProps } from 'ant-design-vue';
import { knowledgeList } from '#/api/operator/knowledgeBase';

/**
 * 需要禁止透传
 * 不禁止会有奇怪的bug 会绑定到selectType上
 * TODO: 未知原因 有待研究
 */
defineOptions({ inheritAttrs: false });

const relations = defineModel('knowledgeIds', {
  default: () => [],
  type: Array as PropType<(string)[]>,
});

const options = ref<SelectProps['options']>([]);

const getOptions = () => {
  knowledgeList().then((res) => {
    options.value = res.rows.map((v: any) => {
      return {
        label: v.kname,
        value: v.id,
      };
    });
  })
}

onMounted(async () => {
  getOptions();
});

</script>

<template>
  <div class="flex flex-1 items-center gap-[6px]">
    <Select v-model:value="relations" :allow-clear="true" :options="options" mode="multiple" class="flex-1"
      placeholder="请选择关联知识库" />
  </div>
</template>
