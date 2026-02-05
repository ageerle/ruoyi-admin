/**
 * @zh_CN 登录页面 url 地址
 */
export const LOGIN_PATH = '/auth/login';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'zh-CN';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: LanguageOption[] = [
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];

/**
 * 默认租户ID
 */
export const DEFAULT_TENANT_ID = '000000';

/**
 * 业务成功 状态码
 */
export const BUSINESS_SUCCESS_CODE = 200;

/**
 * 未授权 状态码(登录超时)
 */
export const UNAUTHORIZED_CODE = 401;
