<script setup lang="ts">
import { computed } from 'vue';
import { Button, Form, FormItem, Input, Switch } from 'ant-design-vue';
import type { ConfigItem, TabsData } from './data';

interface Props {
  activeKey: string;
  formData: Record<string, boolean | string>;
  tabsData: TabsData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'blur', item: ConfigItem, value: string): void;
  (e: 'submit'): void;
}>();

const currentConfigItems = computed(() => {
  return props.tabsData[props.activeKey as keyof TabsData] || [];
});
</script>

<template>
  <Form :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" :model="formData">
    <FormItem
      v-for="item in currentConfigItems"
      :key="item.configName"
      :label="item.configDict"
      :name="item.configName"
    >
      <template v-if="item.configName === 'enabled'">
        <Switch
          v-model:checked="formData[item.configName] as boolean"
        />
      </template>
      <template v-else>
        <Input
          v-model:value="formData[item.configName] as string"
          placeholder="请输入配置值"
          @blur="emit('blur', item, formData[item.configName] as string)"
        />
      </template>
    </FormItem>
    <FormItem :wrapper-col="{ offset: 4, span: 16 }">
      <Button type="primary" size="large" @click="emit('submit')">
        保存配置
      </Button>
    </FormItem>
  </Form>
</template>