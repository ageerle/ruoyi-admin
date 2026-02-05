/**
 * 该文件可自行根据业务逻辑进行调整
 */

import type { HttpResponse } from '@vben/request';
import type {
  BaseAsymmetricEncryption,
  BaseSymmetricEncryption,
} from '@vben/utils';

import { BUSINESS_SUCCESS_CODE, UNAUTHORIZED_CODE } from '@vben/constants';
import { useAppConfig } from '@vben/hooks';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
  stringify,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';
import {
  AesEncryption,
  decodeBase64,
  encodeBase64,
  randomStr,
  RsaEncryption,
} from '@vben/utils';

import { message, Modal } from 'ant-design-vue';
import { isEmpty, isNull } from 'lodash-es';

import { useAuthStore } from '#/store';

import { handleUnauthorizedLogout } from './helper';

const { apiURL, clientId, enableEncrypt, rsaPublicKey, rsaPrivateKey } =
  useAppConfig(import.meta.env, import.meta.env.PROD);

/**
 * 使用非对称加密的实现 前端已经实现RSA/SM2
 *
 * 你可以使用Sm2Encryption来替换 后端也需要同步替换公私钥对
 *
 * 后端文件位置: ruoyi-common/ruoyi-common-encrypt/src/main/java/org/dromara/common/encrypt/filter/DecryptRequestBodyWrapper.java
 *
 * 注意前端sm-crypto库只能支持04开头的公钥! 否则加密会有问题 你可以使用前端的import { logSm2KeyPair } from '@vben/utils';方法来生成
 * 如果你生成的公钥开头不是04 那么不能正常加密
 * 或者使用这个网站来生成: https://tool.hiofd.com/sm2-key-gen/
 */
const asymmetricEncryption: BaseAsymmetricEncryption = new RsaEncryption({
  publicKey: rsaPublicKey,
  privateKey: rsaPrivateKey,
});

/**
 * 对称加密的实现 AES/SM4
 */
const symmetricEncryption: BaseSymmetricEncryption = new AesEncryption();

function createRequestClient(baseURL: string) {
  const client = new RequestClient({
    // 后端地址
    baseURL,
    // 消息提示类型
    errorMessageMode: 'message',
    // 是否返回原生响应 比如：需要获取响应头时使用该属性
    isReturnNativeResponse: false,
    // 需要对返回数据进行处理
    isTransformResponse: true,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    // 不需要
    // 保留此方法只是为了合并方便
    return '';
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  client.addRequestInterceptor({
    fulfilled: (config) => {
      const accessStore = useAccessStore();
      // 添加token
      config.headers.Authorization = formatToken(accessStore.accessToken);
      /**
       * locale跟后台不一致 需要转换
       */
      const language = preferences.app.locale.replace('-', '_');
      config.headers['Accept-Language'] = language;
      config.headers['Content-Language'] = language;
      /**
       * 添加全局clientId
       * 关于header的clientId被错误绑定到实体类
       * https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IC0BDS
       */
      config.headers.ClientID = clientId;
      /**
       * 格式化get/delete参数
       * 如果包含自定义的paramsSerializer则不走此逻辑
       */
      if (
        ['DELETE', 'GET'].includes(config.method?.toUpperCase() || '') &&
        config.params &&
        !config.paramsSerializer
      ) {
        /**
         * 1. 格式化参数 微服务在传递区间时间选择(后端的params Map类型参数)需要格式化key 否则接收不到
         * 2. 数组参数需要格式化 后端才能正常接收 会变成arr=1&arr=2&arr=3的格式来接收
         */
        config.paramsSerializer = (params) =>
          stringify(params, { arrayFormat: 'repeat' });
      }

      const { encrypt } = config;
      // 全局开启请求加密功能 && 该请求开启 && 是post/put请求
      if (
        enableEncrypt &&
        encrypt &&
        ['POST', 'PUT'].includes(config.method?.toUpperCase() || '')
      ) {
        // sm4这里改为randomStr(16)
        const key = randomStr(32);
        const keyWithBase64 = encodeBase64(key);
        config.headers['encrypt-key'] =
          asymmetricEncryption.encrypt(keyWithBase64);
        /**
         * axios会默认给字符串前后加上引号 RSA可以正常解密(加不加都能解密) 但是SM2不行(大坑!!!)
         * 这里通过transformRequest强制返回原始内容
         */
        config.transformRequest = (data) => data;

        config.data =
          typeof config.data === 'object'
            ? symmetricEncryption.encrypt(JSON.stringify(config.data), key)
            : symmetricEncryption.encrypt(config.data, key);
      }
      return config;
    },
  });

  // 通用的错误处理, 如果没有进入上面的错误处理逻辑，就会进入这里
  // 主要处理http状态码不为200(如网络异常/离线)的情况 必须放在在下面的响应拦截器之前
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string) => message.error(msg)),
  );

  client.addResponseInterceptor<HttpResponse>({
    fulfilled: async (response) => {
      const encryptKey = (response.headers ?? {})['encrypt-key'];
      if (encryptKey) {
        /** RSA私钥解密 拿到解密秘钥的base64 */
        const base64Str = asymmetricEncryption.decrypt(encryptKey);
        /** base64 解码 得到请求头的 AES 秘钥 */
        const secret = decodeBase64(base64Str);
        /** 使用aesKey解密 responseData */
        const decryptData = symmetricEncryption.decrypt(
          response.data as unknown as string,
          secret,
        );
        /** 赋值 需要转为对象 */
        response.data = JSON.parse(decryptData);
      }

      const { isReturnNativeResponse, isTransformResponse } = response.config;
      // 是否返回原生响应 比如：需要获取响应时使用该属性
      if (isReturnNativeResponse) {
        return response;
      }
      // 不进行任何处理，直接返回
      // 用于页面代码可能需要直接获取code，data，message这些信息时开启
      if (!isTransformResponse) {
        /**
         * @warning 注意 微服务版本在401(网关)会返回text/plain的头 所以这里代码会无效
         * 我建议你改后端而不是前端来做兼容
         */
        // json数据的判断
        if (response.headers['content-type']?.includes?.('application/json')) {
          /**
           * 需要判断是否登录超时/401
           * 执行登出操作
           */
          const resp = response.data as unknown as HttpResponse;
          // 抛出异常 不再执行
          if (
            typeof resp === 'object' &&
            Reflect.has(resp, 'code') &&
            resp.code === UNAUTHORIZED_CODE
          ) {
            handleUnauthorizedLogout();
          }

          /**
           * 需要判断下载二进制的情况 正常是返回二进制 报错会返回json
           * 当type为blob且content-type为application/json时 则判断已经下载出错
           */
          if (response.config.responseType === 'blob') {
            // 这时候的data为blob类型
            const blob = response.data as unknown as Blob;
            // 拿到字符串转json对象
            response.data = JSON.parse(await blob.text());
            // 然后按正常逻辑执行下面的代码(判断业务状态码)
          } else {
            // 其他类型数据 直接返回
            return response.data;
          }
        } else {
          // 非json数据 直接返回 不做校验
          return response.data;
        }
      }

      const axiosResponseData = response.data;
      if (!axiosResponseData) {
        throw new Error($t('http.apiRequestFailed'));
      }

      // 后端并没有采用严格的{code, msg, data}模式
      const { code, data, msg, ...other } = axiosResponseData;

      // 业务状态码为200 则请求成功
      const hasSuccess =
        Reflect.has(axiosResponseData, 'code') &&
        code === BUSINESS_SUCCESS_CODE;
      if (hasSuccess) {
        let successMsg = msg;

        if (isNull(successMsg) || isEmpty(successMsg)) {
          successMsg = $t(`http.operationSuccess`);
        }

        if (response.config.successMessageMode === 'modal') {
          Modal.success({
            content: successMsg,
            title: $t('http.successTip'),
          });
        } else if (response.config.successMessageMode === 'message') {
          message.success(successMsg);
        }
        // 分页情况下为code msg rows total 并没有data字段
        // 如果有data 直接返回data 没有data将剩余参数(...other)封装为data返回
        // 需要考虑data为null的情况(比如查询为空) 所以这里直接判断undefined
        if (data !== undefined) {
          return data;
        }
        // 没有data 将其他参数包装为data
        return other;
      }
      // 在此处根据自己项目的实际情况对不同的code执行不同的操作
      // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
      let timeoutMsg = '';
      switch (code) {
        // 登录超时
        case UNAUTHORIZED_CODE: {
          handleUnauthorizedLogout();
          break;
        }
        default: {
          if (msg) {
            timeoutMsg = msg;
          }
        }
      }

      // errorMessageMode='modal'的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
      // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
      if (response.config.errorMessageMode === 'modal') {
        Modal.error({
          content: timeoutMsg,
          title: $t('http.errorTip'),
        });
      } else if (response.config.errorMessageMode === 'message') {
        message.error(timeoutMsg);
      }

      throw new Error(timeoutMsg || $t('http.apiRequestFailed'));
    },
  });

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL);

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
