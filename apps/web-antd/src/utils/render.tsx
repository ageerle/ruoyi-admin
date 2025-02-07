import type { DictData } from '#/api/system/dict/dict-data-model';

import { JsonPreview } from '@vben/common-ui';
import { Icon } from '@vben/icons';

import { Tag } from 'ant-design-vue';

import { DictTag } from '#/components/dict';

import { getDict } from './dict';

/**
 * 渲染标签
 * @param text 文字
 * @param color 颜色
 * @returns render
 */
function renderTag(text: string, color?: string) {
  return <Tag color={color}>{text}</Tag>;
}

/**
 *
 * @param tags 标签list
 * @param wrap 是否换行显示
 * @param [gap] 间隔
 * @returns render
 */
export function renderTags(tags: string[], wrap = false, gap = 1) {
  return (
    <div class={['flex', `gap-${gap}`, wrap ? 'flex-col' : 'flex-row']}>
      {tags.map((tag, index) => {
        return <div key={index}>{renderTag(tag)}</div>;
      })}
    </div>
  );
}

/**
 *
 * @param json json对象 接受object/string类型
 * @returns json预览
 */
export function renderJsonPreview(json: any) {
  if (typeof json !== 'object' && typeof json !== 'string') {
    return <span>{json}</span>;
  }
  if (typeof json === 'object') {
    return <JsonPreview data={json} />;
  }
  try {
    const obj = JSON.parse(json);
    // 基本数据类型可以被转为json
    if (typeof obj !== 'object') {
      return <span>{obj}</span>;
    }
    return <JsonPreview data={obj} />;
  } catch {
    return <span>{json}</span>;
  }
}

/**
 * iconify图标
 * @param icon icon名称
 * @returns render
 */
export function renderIcon(icon: string) {
  return <Icon icon={icon}></Icon>;
}

// httpMethod
export function renderHttpMethodTag(type: string) {
  const method = type.toUpperCase();
  let color = 'default';
  const title = `${method}请求`;
  switch (method) {
    case 'DELETE': {
      color = 'red';
      break;
    }
    case 'GET': {
      color = 'green';
      break;
    }
    case 'POST': {
      color = 'blue';
      break;
    }
    case 'PUT': {
      color = 'orange';
      break;
    }
  }
  return <Tag color={color}>{title}</Tag>;
}

export function renderDictTag(value: string, dicts: DictData[]) {
  return <DictTag dicts={dicts} value={value}></DictTag>;
}

/**
 * render多个dictTag
 * @param value key数组 string[]类型
 * @param dicts 字典数组
 * @param wrap 是否需要换行显示
 * @param [gap] 间隔
 * @returns render
 */
export function renderDictTags(
  value: string[],
  dicts: DictData[],
  wrap = true,
  gap = 1,
) {
  if (!Array.isArray(value)) {
    return <div>{value}</div>;
  }
  return (
    <div class={['flex', `gap-${gap}`, wrap ? 'flex-col' : 'flex-row']}>
      {value.map((item, index) => {
        return <div key={index}>{renderDictTag(item, dicts)}</div>;
      })}
    </div>
  );
}

/**
 * 显示字典标签 一般是table使用
 * @param value 值
 * @param dictName dictName
 * @returns tag
 */
export function renderDict(value: string, dictName: string) {
  const dictInfo = getDict(dictName);
  return renderDictTag(value, dictInfo);
}

export function renderIconSpan(
  icon: string,
  value: string,
  center = false,
  marginLeft = '2px',
) {
  const justifyCenter = center ? 'justify-center' : '';
  return (
    <span class={['flex', 'items-center', justifyCenter]}>
      {renderIcon(icon)}
      <span style={{ marginLeft }}>{value}</span>
    </span>
  );
}

const osOptions = [
  { icon: 'devicon:windows8', value: 'windows' },
  { icon: 'devicon:linux', value: 'linux' },
  { icon: 'wpf:macos', value: 'osx' },
  { icon: 'flat-color-icons:android-os', value: 'android' },
  { icon: 'majesticons:iphone-x-apps-line', value: 'iphone' },
];

/**
 * 浏览器图标
 * cn.hutool.http.useragent -> browers
 */
const browserOptions = [
  { icon: 'logos:chrome', value: 'chrome' },
  { icon: 'logos:microsoft-edge', value: 'edge' },
  { icon: 'logos:firefox', value: 'firefox' },
  { icon: 'logos:opera', value: 'opera' },
  { icon: 'logos:safari', value: 'safari' },
  { icon: 'mdi:wechat', value: 'micromessenger' },
  { icon: 'logos:quarkus-icon', value: 'quark' },
  { icon: 'mdi:wechat', value: 'wxwork' },
  { icon: 'simple-icons:tencentqq', value: 'qq' },
  { icon: 'ri:dingding-line', value: 'dingtalk' },
  { icon: 'arcticons:uc-browser', value: 'uc' },
  { icon: 'ri:baidu-fill', value: 'baidu' },
];

export function renderOsIcon(os: string, center = false) {
  if (!os) {
    return;
  }
  let current = osOptions.find((item) =>
    os.toLocaleLowerCase().includes(item.value),
  );
  // windows要特殊处理
  if (os.toLocaleLowerCase().includes('windows')) {
    current = osOptions[0];
  }
  if (current) {
    return renderIconSpan(current.icon, os, center, '5px');
  }
  // 返回默认
  const defaultIcon = 'ic:outline-computer';
  return renderIconSpan(defaultIcon, os, center, '5px');
}

export function renderBrowserIcon(browser: string, center = false) {
  if (!browser) {
    return;
  }
  const current = browserOptions.find((item) =>
    browser.toLocaleLowerCase().includes(item.value),
  );
  if (current) {
    return renderIconSpan(current.icon, browser, center, '5px');
  }
  // 返回默认
  const defaultIcon = 'ph:browser-duotone';
  return renderIconSpan(defaultIcon, browser, center, '5px');
}
