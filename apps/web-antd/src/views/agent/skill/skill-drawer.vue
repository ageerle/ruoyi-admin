<script setup lang="ts">
import type { AgentSkillForm } from '#/api/agent/skill';
import type { ID } from '#/api/common';

import { computed, shallowRef } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { agentSkillAdd, agentSkillInfo, agentSkillUpdate } from '#/api/agent/skill';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { skillFormSchema } from './data';

const emit = defineEmits<{ reload: [] }>();
const skillId = shallowRef<ID>();
const title = computed(() => (skillId.value ? '编辑技能' : '新增技能'));

const [SkillForm, formApi] = useVbenForm({
  layout: 'vertical',
  schema: skillFormSchema(),
  showDefaultActions: false,
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff({
  initializedGetter: defaultFormValueGetter(formApi),
  currentGetter: defaultFormValueGetter(formApi),
});

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  async onClosed() {
    await formApi.resetForm();
    resetInitialized();
  },
  async onConfirm() {
    drawerApi.lock(true);
    try {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = (await formApi.getValues()) as AgentSkillForm;
      if (skillId.value) {
        await agentSkillUpdate({ ...values, id: skillId.value });
      } else {
        await agentSkillAdd(values);
      }
      resetInitialized();
      emit('reload');
      drawerApi.close();
    } finally {
      drawerApi.lock(false);
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    const { id } = drawerApi.getData() as { id?: ID };
    skillId.value = id;
    if (id) {
      drawerApi.drawerLoading(true);
      try {
        await formApi.setValues(await agentSkillInfo(id));
      } finally {
        drawerApi.drawerLoading(false);
      }
    }
    await markInitialized();
  },
});
</script>

<template>
  <BasicDrawer :title="title" class="w-[640px]">
    <SkillForm />
  </BasicDrawer>
</template>
