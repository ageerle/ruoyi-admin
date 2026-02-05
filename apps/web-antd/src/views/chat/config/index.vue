<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Card, message, Segmented } from 'ant-design-vue';

import { Page } from '@vben/common-ui';

import { addConfig, listConfig } from '#/api/operator/configurationManage';
import { configOptions, initTabsData, type ConfigItem, type ConfigResponseItem, type TabsData } from './data';
import ConfigForm from './config-form.vue';

const tabsData = initTabsData();
const activeKey = ref('mail');
const formData = ref<Record<string, boolean | string>>({});

onMounted(() => {
  getConfig();
});

async function getConfig() {
  try {
    const res: ConfigResponseItem[] = await listConfig();
    res.rows.forEach((item) => {
      if (tabsData.value[item.category]) {
        tabsData.value[item.category].forEach((items: ConfigItem) => {
          if (items.configName === item.configName) {
            items.configValue = item.configValue;
            items.id = item.id;
          }
        });
      }
    });
    handleChange(activeKey.value);
  } catch (error) {
    console.error('获取配置信息失败:', error);
  }
}

const handleChange = (key: string) => {
  formData.value = {};
  const currentData = tabsData.value[key as keyof typeof tabsData.value];
  if (currentData) {
    currentData.forEach((item) => {
      formData.value[item.configName] = item.configValue;
    });
  }
};

const handleSubmit = () => {
  const name = activeKey.value as keyof typeof tabsData.value;
  addConfig(tabsData.value[name]).then(() => {
    message.success('保存成功');
  });
};

const handleBlur = (item: ConfigItem, value: string) => {
  const name = activeKey.value as keyof typeof tabsData.value;
  tabsData.value[name].forEach((items: any) => {
    if (items.configName === item.configName) {
      items.configValue = value;
    }
  });
};
</script>

<template>
  <Page :auto-content-height="true">
    <Card class="h-full">
      <div class="config-container">
        <div class="config-header">
          <Segmented
            v-model:value="activeKey"
            :options="configOptions"
            @change="handleChange"
            block
          />
        </div>
        <div class="config-content">
          <ConfigForm
            :active-key="activeKey"
            :form-data="formData"
            :tabs-data="tabsData"
            @blur="handleBlur"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </Card>
  </Page>
</template>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.config-header {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border);
}

.config-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 20px;
}

:deep(.ant-input),
:deep(.ant-input-number) {
  border-radius: 4px;
}

:deep(.ant-switch) {
  background-color: rgba(0, 0, 0, 0.25);
}

:deep(.ant-switch.ant-switch-checked) {
  background-color: #1890ff;
}
</style>

