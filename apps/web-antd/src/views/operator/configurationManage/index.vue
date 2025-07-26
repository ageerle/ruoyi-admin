<script lang="ts" setup>
import type { TabsProps } from 'ant-design-vue';

import type { Ref } from 'vue';

import { onMounted, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Switch,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { addConfig, listConfig } from '#/api/system/configurationManage';

interface ConfigItem {
  category: string;
  configName: string;
  configValue: string;
  configDict: string;
  id: string;
}

interface TabsData {
  chat: ConfigItem[];
  mail: ConfigItem[];
  pay: ConfigItem[];
  review: ConfigItem[];
  sys: ConfigItem[];
  weaviate: ConfigItem[];
}

interface ConfigResponseItem {
  category: keyof TabsData;
  configName: string;
  configValue: string;
  id: string;
}

const tabsData: Ref<TabsData> = ref({
  chat: [
    {
      category: 'chat',
      configName: 'apiKey',
      configValue: '',
      configDict: 'API 密钥',
      id: '',
    },
    {
      category: 'chat',
      configName: 'apiHost',
      configValue: '',
      configDict: 'API 地址',
      id: '',
    },
  ],
  mail: [
    {
      category: 'mail',
      configName: 'host',
      configValue: '',
      configDict: '主机地址',
      id: '',
    },
    {
      category: 'mail',
      configName: 'port',
      configValue: '',
      configDict: '主机端口',
      id: '',
    },
    {
      category: 'mail',
      configName: 'from',
      configValue: '',
      configDict: '发送方',
      id: '',
    },
    {
      category: 'mail',
      configName: 'user',
      configValue: '',
      configDict: '用户名',
      id: '',
    },
    {
      category: 'mail',
      configName: 'pass',
      configValue: '',
      configDict: '授权码',
      id: '',
    },
    {
      category: 'mail',
      configName: 'mailTitle',
      configValue: '',
      configDict: '邮箱标题',
      id: '',
    },
    {
      category: 'mail',
      configName: 'mailModel',
      configValue: '',
      configDict: '邮箱模板',
      id: '',
    },
  ],
  pay: [
    {
      category: 'pay',
      configName: 'pid',
      configValue: '',
      configDict: '商户PID',
      id: '',
    },
    {
      category: 'pay',
      configName: 'key',
      configValue: '',
      configDict: '商户密钥',
      id: '',
    },
    {
      category: 'pay',
      configName: 'payUrl',
      configValue: '',
      configDict: '支付地址',
      id: '',
    },
    {
      category: 'pay',
      configName: 'notify_url',
      configValue: '',
      configDict: '回调地址',
      id: '',
    },
  ],
  review: [
    {
      category: 'review',
      configName: 'apiKey',
      configValue: '',
      configDict: 'apiKey',
      id: '',
    },
    {
      category: 'review',
      configName: 'secretKey',
      configValue: '',
      configDict: 'secretKey',
      id: '',
    },
    {
      category: 'review',
      configName: 'enabled',
      configValue: '',
      configDict: '文本审核',
      id: '',
    },
  ],
  weaviate: [
    {
      category: 'weaviate',
      configName: 'protocol',
      configValue: '',
      configDict: '协议',
      id: '',
    },
    {
      category: 'weaviate',
      configName: 'host',
      configValue: '',
      configDict: '地址',
      id: '',
    },
    {
      category: 'weaviate',
      configName: 'classname',
      configValue: '',
      configDict: '分类名称',
      id: '',
    },
  ],
  sys: [
    {
      category: 'sys',
      configName: 'name',
      configValue: '',
      configDict: '网站名称',
      id: '',
    },
    {
      category: 'sys',
      configName: 'logoImage',
      configValue: '',
      configDict: '网站logo',
      id: '',
    },
    {
      category: 'sys',
      configName: 'copyright',
      configValue: '',
      configDict: '版权信息',
      id: '',
    },
    {
      category: 'sys',
      configName: 'customImage',
      configValue: '',
      configDict: '客服二维码',
      id: '',
    },
  ],
});

onMounted(() => {
  getConfig();
});

// 定义获取配置的方法
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

const activeKey = ref('1');
const tabPosition = ref<TabsProps['tabPosition']>('left');
const tabList = ref([
  {
    key: '1',
    label: '基础配置',
    data: tabsData.value.chat,
  },
  {
    key: '2',
    label: '邮箱配置',
    data: tabsData.value.mail,
  },
  {
    key: '3',
    label: '支付配置',
    data: tabsData.value.pay,
  },
  {
    key: '4',
    label: '百度配置',
    data: tabsData.value.review,
  },
  {
    key: '5',
    label: '系统配置',
    data: tabsData.value.sys,
  },
  {
    key: '6',
    label: '向量库配置',
    data: tabsData.value.weaviate,
  },
]);

const formData = ref<Record<string, boolean | string>>({});
const handleSubmit = () => {
  const name = getTabName();
  addConfig(tabsData.value[name]).then(() => {
    message.success('保存成功');
  });
};
const handleChange = (key: number | string) => {
  const currentTab = tabList.value.find((tab) => tab.key === String(key));
  if (currentTab) {
    formData.value = {}; // 清空之前的表单数据
    currentTab.data.forEach((item) => {
      formData.value[item.configName] = item.configValue;
    });
  }
};

function getTabName() {
  let name: keyof typeof tabsData.value = 'chat';
  switch (activeKey.value) {
    case '1': {
      name = 'chat';

      break;
    }
    case '2': {
      name = 'mail';

      break;
    }
    case '3': {
      name = 'pay';

      break;
    }
    case '4': {
      name = 'review';

      break;
    }
    case '5': {
      name = 'sys';

      break;
    }
    case '6': {
      name = 'weaviate';

      break;
    }
    // No default
  }
  return name;
}

const handleBlur = (item: any, value: string) => {
  const name = getTabName();
  tabsData.value[name].forEach((items: any) => {
    if (items.configName === item.configName) {
      items.configValue = value;
    }
  });
};
</script>

<template>
  <div class="configuration-manage">
    <Tabs
      v-model:active-key="activeKey"
      :tab-position="tabPosition"
      type="card"
      @change="handleChange"
    >
      <TabPane v-for="item in tabList" :key="item.key" :tab="item.label">
        <Form :label-col="{ span: 2 }" :model="formData">
          <div>
            <FormItem
              v-for="items in item.data"
              :key="items.id"
              :label="items.configDict"
              :name="items.configName"
            >
              <template v-if="items.configName === 'enabled'">
                <Switch
                  v-model:checked="formData[items.configName] as boolean"
                />
              </template>
              <template v-else>
                <Input
                  v-model:value="formData[items.configName] as string"
                  @blur="
                    handleBlur(items, formData[items.configName] as string)
                  "
                />
              </template>
            </FormItem>
          </div>
          <FormItem style="text-align: center">
            <Button type="primary" @click="handleSubmit">保存</Button>
          </FormItem>
        </Form>
      </TabPane>
    </Tabs>
  </div>
</template>

<style lang="less" scoped>
.configuration-manage {
  padding: 10px;
  height: 100%;
}
</style>
