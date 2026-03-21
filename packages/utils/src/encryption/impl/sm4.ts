import CryptoJS from 'crypto-js';
import { sm4 } from 'sm-crypto';

import { BaseSymmetricEncryption } from '../base';

/**
 * SM4 实现
 */
export class Sm4Encryption extends BaseSymmetricEncryption {
  /**
   * 解密 data必须为hex字符串 可使用后端EncryptUtils.encryptBySm4Hex来加密
   * @param hexString 待解密数据 只接受hex类型的字符串
   * @param key 秘钥
   * @returns result
   */
  override decrypt(hexString: string, key: string): string {
    this.checkKey(key);
    const keyHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(key));
    return sm4.decrypt(hexString, keyHex);
  }

  override encrypt(data: string, key: string): string {
    this.checkKey(key);
    /**
     * 转hex字符串
     * encrypt方法的key需要为`16进制字符串`而非`原始字符串`
     * 比如字符串ab a为0x61 b为0x62  转字符串为 6162
     */
    const keyHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(key));

    return sm4.encrypt(data, keyHex);
  }

  /**
   * key长度只能为16位字符串
   * @param key key
   */
  private checkKey(key: string) {
    if (key.length !== 16) {
      throw new Error('SM4 key must be 16 bytes');
    }
  }
}
