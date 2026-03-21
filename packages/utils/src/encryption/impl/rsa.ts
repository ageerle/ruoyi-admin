import JSEncrypt from 'jsencrypt';

import { BaseAsymmetricEncryption } from '../base';

/**
 * RSA 实现
 */
export class RsaEncryption extends BaseAsymmetricEncryption {
  override decrypt(str: string): string {
    const instance = new JSEncrypt();
    instance.setPrivateKey(this.privateKey);
    const ret = instance.decrypt(str);

    if (ret === false) {
      throw new Error('RsaEncryption decrypt error');
    }

    return ret;
  }

  override encrypt(str: string): string {
    const instance = new JSEncrypt();
    instance.setPublicKey(this.publicKey);
    const ret = instance.encrypt(str);
    if (ret === false) {
      throw new Error('RsaEncryption encrypt error');
    }
    return ret;
  }
}
