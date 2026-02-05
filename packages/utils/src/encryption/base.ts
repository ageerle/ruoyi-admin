export interface EncryptionOptions {
  /**
   * 私钥
   */
  privateKey: string;

  /**
   * 公钥
   */
  publicKey: string;
}

/**
 * 非对称加解密 抽象类
 * 提供基本的加密和解密功能接口
 */
export abstract class BaseAsymmetricEncryption {
  /**
   * 私钥
   */
  protected privateKey: string;

  /**
   * 公钥
   */
  protected publicKey: string;

  /**
   * 构造函数
   * @param options 加解密选项，包含公钥和私钥
   */
  constructor(options: EncryptionOptions) {
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
  }

  /**
   * 解密方法
   * @param encryptedData 解密后的数据
   * @returns 解密后的原始数据
   */
  abstract decrypt(encryptedData: string): string;

  /**
   * 加密方法
   * @param data 需要加密的数据
   * @returns 加密后的数据
   */
  abstract encrypt(data: string): string;
}

/**
 * 对称加解密抽象类
 */
export abstract class BaseSymmetricEncryption {
  /**
   * 解密方法
   * @param data 解密后的数据
   * @param key 密钥
   * @returns 解密后的原始数据
   */
  abstract decrypt(data: string, key: string): string;

  /**
   * 加密方法
   * @param data 需要加密的数据
   * @param key 密钥
   * @returns 加密后的数据
   */
  abstract encrypt(data: string, key: string): string;
}
