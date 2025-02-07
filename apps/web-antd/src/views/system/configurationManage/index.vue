<script lang="ts" setup>
import type { TabsProps } from 'ant-design-vue';

import { onMounted, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  Switch,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { listConfig } from '#/api/system/configurationManage';

onMounted(() => {
  getConfig();
});

async function getConfig() {
  const res = await listConfig();
  console.log(res);
}

const tabsData = ref({
  chat: [
    { configName: 'apiKey', configValue: '', configDict: 'API 密钥', id: '' },
    { configName: 'apiHost', configValue: '', configDict: 'API 地址', id: '' },
  ],
  mj: [
    { configName: 'imagine', configValue: '', configDict: '文生图', id: '' },
    { configName: 'blend', configValue: '', configDict: '图生图', id: '' },
    { configName: 'describe', configValue: '', configDict: '图生文', id: '' },
    { configName: 'change', configValue: '', configDict: '变化价格', id: '' },
    { configName: 'upsample', configValue: '', configDict: '放大价格', id: '' },
    { configName: 'inpaint', configValue: '', configDict: '局部重绘', id: '' },
    {
      configName: 'faceSwapping',
      configValue: '',
      configDict: '换脸价格',
      id: '',
    },
    {
      configName: 'shorten',
      configValue: '',
      configDict: '提示词分析',
      id: '',
    },
  ],
  pay: [
    { configName: 'pid', configValue: '', configDict: '商户PID', id: '' },
    { configName: 'key', configValue: '', configDict: '商户密钥', id: '' },
    { configName: 'payUrl', configValue: '', configDict: '支付地址', id: '' },
    {
      configName: 'notify_url',
      configValue: '',
      configDict: '回调地址',
      id: '',
    },
  ],
  review: [
    { configName: 'apiKey', configValue: '', configDict: 'apiKey', id: '' },
    {
      configName: 'secretKey',
      configValue: '',
      configDict: 'secretKey',
      id: '',
    },
    { configName: 'enabled', configValue: '', configDict: '文本审核', id: '' },
  ],
  weixin: [
    { configName: 'appId', configValue: '', configDict: '应用ID', id: '' },
    {
      configName: 'appSecret',
      configValue: '',
      configDict: '应用密钥',
      id: '',
    },
    { configName: 'mchId', configValue: '', configDict: '商户ID', id: '' },
    {
      configName: 'notifyUrl',
      configValue: '',
      configDict: '回调地址',
      id: '',
    },
    { configName: 'enabled', configValue: '', configDict: '开启支付', id: '' },
  ],
  sys: [
    { configName: 'name', configValue: '', configDict: '网站名称', id: '' },
    {
      configName: 'logoImage',
      configValue: '',
      configDict: '网站logo',
      id: '',
    },
    {
      configName: 'copyright',
      configValue: '',
      configDict: '版权信息',
      id: '',
    },
    {
      configName: 'customImage',
      configValue: '',
      configDict: '客服二维码',
      id: '',
    },
    { configName: 'model', configValue: '', configDict: '系统模型', id: '' },
  ],
  stripe: [
    { configName: 'success', configValue: '', configDict: '成功回调', id: '' },
    { configName: 'cancel', configValue: '', configDict: '取消回调', id: '' },
    { configName: 'key', configValue: '', configDict: '支付密钥', id: '' },
    { configName: 'secret', configValue: '', configDict: '回调密钥', id: '' },
    { configName: 'prompt', configValue: '', configDict: '提示语', id: '' },
    { configName: 'enabled', configValue: '', configDict: '开启支付', id: '' },
  ],
});

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

const formData = ref({});
const handleSubmit = () => {
  console.log(formData.value);
};
const handleChange = (key: string) => {
  const currentTab = tabList.value.find((tab) => tab.key === key);
  if (currentTab) {
    formData.value = {}; // 清空之前的表单数据
    currentTab.data.forEach((item) => {
      formData.value[item.configName] = item.configValue;
    });
  }
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
                <Switch v-model:checked="formData[items.configName]" />
              </template>
              <template v-else>
                <Input v-model:value="formData[items.configName]" />
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
  // background-color: #fff;
  height: 100%;
}
</style>
