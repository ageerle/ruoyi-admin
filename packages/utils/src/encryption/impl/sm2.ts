/* eslint-disable prefer-template */
/* eslint-disable no-console */
import { sm2 } from 'sm-crypto';

import { BaseAsymmetricEncryption } from '../base';

/**
 * SM2 实现
 * 注意生成的公钥必须为04开头 或者使用下面的generateSm2KeyPair生成
 * @see https://tool.hiofd.com/sm2-key-gen/ 这里可以生成04开头的SM2密钥对
 */
export class Sm2Encryption extends BaseAsymmetricEncryption {
  override decrypt(hexStr: string): string {
    /**
     * 后端必须使用`EncryptUtils.encryptBySm2Hex`来加密而不是base64
     * 后端返回会固定带04前缀 需要去除
     *
     * @see https://github.com/JuneAndGreen/sm-crypto?tab=readme-ov-file#%E5%8A%A0%E5%AF%86%E8%A7%A3%E5%AF%86
     * ps：密文会在解密时自动补充 04，如遇到其他工具补充的 04 需手动去除再传入。
     */
    if (hexStr.startsWith('04')) {
      hexStr = hexStr.slice(2);
    }
    return sm2.doDecrypt(hexStr, this.privateKey);
  }

  override encrypt(str: string): string {
    /**
     * sm2解密有千分之几的错误，报异常java.lang.IllegalArgumentException: Invalid point coordinates
     * @see https://github.com/chinabugotech/hutool/issues/3262
     *
     * 固定加上04前缀 避免出现上述问题
     */
    return '04' + sm2.doEncrypt(str, this.publicKey);
  }
}

export function generateSm2KeyPair() {
  const { privateKey, publicKey } = sm2.generateKeyPairHex();
  return {
    privateKey,
    publicKey,
  };
}

export function logSm2KeyPair() {
  const { privateKey, publicKey } = generateSm2KeyPair();
  console.log('privateKey', privateKey);
  console.log('publicKey', publicKey);
}
