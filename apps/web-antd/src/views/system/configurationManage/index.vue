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
  mj: ConfigItem[];
  pay: ConfigItem[];
  review: ConfigItem[];
  weixin: ConfigItem[];
  sys: ConfigItem[];
  stripe: ConfigItem[];
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
  mj: [
    {
      category: 'mj',
      configName: 'imagine',
      configValue: '',
      configDict: '文生图',
      id: '',
    },
    {
      category: 'mj',
      configName: 'blend',
      configValue: '',
      configDict: '图生图',
      id: '',
    },
    {
      category: 'mj',
      configName: 'describe',
      configValue: '',
      configDict: '图生文',
      id: '',
    },
    {
      category: 'mj',
      configName: 'change',
      configValue: '',
      configDict: '变化价格',
      id: '',
    },
    {
      category: 'mj',
      configName: 'upsample',
      configValue: '',
      configDict: '放大价格',
      id: '',
    },
    {
      category: 'mj',
      configName: 'inpaint',
      configValue: '',
      configDict: '局部重绘',
      id: '',
    },
    {
      category: 'mj',
      configName: 'faceSwapping',
      configValue: '',
      configDict: '换脸价格',
      id: '',
    },
    {
      category: 'mj',
      configName: 'shorten',
      configValue: '',
      configDict: '提示词分析',
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
  weixin: [
    {
      category: 'weixin',
      configName: 'appId',
      configValue: '',
      configDict: '应用ID',
      id: '',
    },
    {
      category: 'weixin',
      configName: 'appSecret',
      configValue: '',
      configDict: '应用密钥',
      id: '',
    },
    {
      category: 'weixin',
      configName: 'mchId',
      configValue: '',
      configDict: '商户ID',
      id: '',
    },
    {
      category: 'weixin',
      configName: 'notifyUrl',
      configValue: '',
      configDict: '回调地址',
      id: '',
    },
    {
      category: 'weixin',
      configName: 'enabled',
      configValue: '',
      configDict: '开启支付',
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
    {
      category: 'sys',
      configName: 'model',
      configValue: '',
      configDict: '系统模型',
      id: '',
    },
  ],
  stripe: [
    {
      category: 'stripe',
      configName: 'success',
      configValue: '',
      configDict: '成功回调',
      id: '',
    },
    {
      category: 'stripe',
      configName: 'cancel',
      configValue: '',
      configDict: '取消回调',
      id: '',
    },
    {
      category: 'stripe',
      configName: 'key',
      configValue: '',
      configDict: '支付密钥',
      id: '',
    },
    {
      category: 'stripe',
      configName: 'secret',
      configValue: '',
      configDict: '回调密钥',
      id: '',
    },
    {
      category: 'stripe',
      configName: 'prompt',
      configValue: '',
      configDict: '提示语',
      id: '',
    },
    {
      category: 'stripe',
      configName: 'enabled',
      configValue: '',
      configDict: '开启支付',
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
    res.forEach((item) => {
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
    label: '绘图费用',
    data: tabsData.value.mj,
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
    label: '微信配置',
    data: tabsData.value.weixin,
  },
  {
    key: '6',
    label: '系统配置',
    data: tabsData.value.sys,
  },
  {
    key: '7',
    label: 'stripe支付',
    data: tabsData.value.stripe,
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
      name = 'mj';

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
      name = 'weixin';

      break;
    }
    case '6': {
      name = 'sys';

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
