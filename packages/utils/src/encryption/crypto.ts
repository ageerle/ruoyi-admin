import CryptoJS from 'crypto-js';

/**
 * 随机字符串
 *
 * @returns str
 */
export function randomStr(length = 32) {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i)
    result += str[Math.floor(Math.random() * str.length)];
  return result;
}

/**
 * base64编码
 * @param str
 * @returns base64编码
 */
export function encodeBase64(str: string) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}

/**
 * 解码base64
 */
export function decodeBase64(str: string) {
  return CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);
}
