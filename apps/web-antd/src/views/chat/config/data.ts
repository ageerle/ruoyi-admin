import type { Ref } from 'vue';

import { ref } from 'vue';

export interface ConfigItem {
  category: string;
  configName: string;
  configValue: string;
  configDict: string;
  id: string;
}

export interface TabsData {
  mail: ConfigItem[];
  pay: ConfigItem[];
  review: ConfigItem[];
  sys: ConfigItem[];
  weaviate: ConfigItem[];
}

export interface ConfigResponseItem {
  category: keyof TabsData;
  configName: string;
  configValue: string;
  id: string;
}

export const configOptions = [
  { label: '邮箱配置', value: 'mail' },
  { label: '支付配置', value: 'pay' },
  { label: '微信配置', value: 'wechat' },
  { label: '系统配置', value: 'sys' },
  { label: '向量库配置', value: 'vector' },
];

export function initTabsData(): Ref<TabsData> {
  return ref({
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
      }
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
    wechat: [
      {
        category: 'wechat',
        configName: 'apiKey',
        configValue: '',
        configDict: 'apiKey',
        id: '',
      },
      {
        category: 'wechat',
        configName: 'secretKey',
        configValue: '',
        configDict: 'secretKey',
        id: '',
      }
    ],
    vector: [
      {
        category: 'vector',
        configName: 'protocol',
        configValue: '',
        configDict: '协议',
        id: '',
      },
      {
        category: 'vector',
        configName: 'host',
        configValue: '',
        configDict: '地址',
        id: '',
      },
      {
        category: 'vector',
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
      }
    ],
  });
}
