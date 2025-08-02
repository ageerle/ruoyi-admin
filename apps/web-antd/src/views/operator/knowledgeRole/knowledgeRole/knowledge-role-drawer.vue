<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { useVbenForm } from '#/adapter/form';

import { drawerSchema } from './data';
import { knowledgeRoleAdd, knowledgeRoleInfo, knowledgeRoleUpdate } from '#/api/operator/knowledgeRole/knowledge-role';
import KnowledgePicker from './knowledge-picker.vue';

const emit = defineEmits<{ reload: [] }>();

interface DrawerProps {
  id?: number | string;
  groupId: number | string;
}

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 80,
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const knowledgeIds = ref<Array<string>>([]);

const [BasicDrawer, drawerApi] = useVbenDrawer({
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    const { id, groupId } = drawerApi.getData() as DrawerProps;
    formApi.setFieldValue('groupId', groupId);

    isUpdate.value = !!id;
    if (isUpdate.value && id) {
      const record = await knowledgeRoleInfo(id);
      knowledgeIds.value = record.knowledgeIds ? record.knowledgeIds : [];
      await formApi.setValues(record);
    } else {
      knowledgeIds.value = [];
    }
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.drawerLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    data.knowledgeIds = knowledgeIds.value;
    await (isUpdate.value ? knowledgeRoleUpdate(data) : knowledgeRoleAdd(data));
    emit('reload');
    await handleCancel();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.drawerLoading(false);
  }
}

async function handleCancel() {
  drawerApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicDrawer :close-on-click-modal="false" :title="title" class="w-[600px]">
    <BasicForm>
      <template #knowledgeIds="slotProps">
        <KnowledgePicker v-bind="slotProps" v-model:knowledge-ids="knowledgeIds" />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
