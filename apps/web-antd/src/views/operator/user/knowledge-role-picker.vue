<script setup lang="ts">
import type { SelectProps } from 'ant-design-vue';

import type { PropType } from 'vue';

import { computed, onMounted, ref } from 'vue';

import { RadioGroup, Select } from 'ant-design-vue';

import { knowledgeRoleList } from '#/api/operator/knowledgeRole/knowledge-role';
import { knowledgeRoleGroupList } from '#/api/operator/knowledgeRole/knowledge-role-group';

/**
 * 需要禁止透传
 * 不禁止会有奇怪的bug 会绑定到selectType上
 * TODO: 未知原因 有待研究
 */
defineOptions({ inheritAttrs: false });

const options = [
  { label: '角色', value: 'role' },
  { label: '角色组', value: 'roleGroup' },
] as const;

/**
 * 角色组下拉
 */
const roleOptions = ref<SelectProps['options']>([]);

/**
 * 角色下拉
 */
const roleGroupOptions = ref<SelectProps['options']>([]);

/**
 * 主要是加了const报错
 */
const computedOptions = computed(
  () => options as unknown as { label: string; value: string }[],
);

const kroleGroupType = defineModel('kroleGroupType', {
  default: 'role',
  type: String as PropType<'role' | 'roleGroup'>,
});

const kroleGroupIds = defineModel('kroleGroupIds', {
  default: undefined,
  type: Array as PropType<Array<string>>,
});

function handleSelectTypeChange() {
  // 切换时清空id
  kroleGroupIds.value = [];
}

const getOptions = () => {
  knowledgeRoleList().then((res) => {
    roleOptions.value = res.rows.map((v: any) => {
      return {
        label: `${v.name} (${v.groupName})`,
        value: v.id,
      };
    });
  })

  knowledgeRoleGroupList().then((res) => {
    roleGroupOptions.value = res.rows.map((v: any) => {
      return {
        label: `${v.name}`,
        value: v.id,
      };
    });
  })
}

onMounted(async () => {
  console.log(kroleGroupType.value, kroleGroupIds.value, 123123)
  getOptions();
});
</script>

<template>
  <div class="flex flex-1 items-center gap-[6px]">
    <RadioGroup v-model:value="kroleGroupType" :options="computedOptions" button-style="solid" option-type="button"
      @change="handleSelectTypeChange" />
    <Select v-if="kroleGroupType === 'role'" v-model:value="kroleGroupIds" :allow-clear="true" :options="roleOptions"
      mode="multiple" class="flex-1" placeholder="请选择角色" />
    <Select v-if="kroleGroupType === 'roleGroup'" v-model:value="kroleGroupIds" :allow-clear="true"
      :options="roleGroupOptions" mode="multiple" class="flex-1" placeholder="请选择角色组" />
  </div>
</template>
