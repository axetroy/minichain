import { Service, Inject, Container } from "typedi";
import * as crypto from "crypto";
import * as Base58 from "bs58";
import * as validate from "bitcoin-address-validation";
import { BlockChain } from "./BlockChain";

@Service()
export class Account {
  @Inject(() => BlockChain)
  public blockchain!: BlockChain;
  constructor() {
    this.blockchain = Container.get(BlockChain);
    this.blockchain.account = this;
  }
  // 地址生成参考: https://www.jianshu.com/p/954e143e97d2
  public generateAddrFromPublicKey(publicKey: string): string {
    // hash160运算就是先进行SHA256, 再进行RMD160
    // 结果加上前缀符, 一般是00
    // 结果执行2次SHA256, 取前8位作为校验和
    // 与有前缀符的结果合并
    // 最后进行base58加密
    const publickKeyHash = crypto
      .createHash("sha256")
      .update(Buffer.from(publicKey, "hex"))
      .digest("hex");

    const hash160 = crypto
      .createHash("rmd160")
      .update(Buffer.from(publickKeyHash, "hex"))
      .digest("hex");

    const version = "00";

    const hash1 = crypto
      .createHash("sha256")
      .update(Buffer.from(version + hash160, "hex"))
      .digest("hex");

    const hash2 = crypto
      .createHash("sha256")
      .update(Buffer.from(hash1, "hex"))
      .digest("hex");

    // 截取4个字节，因为是 16 进制，一个字节占2个字符，所以截取8位
    const checksum = hash2
      .split("")
      .slice(0, 8)
      .join("");

    const addr = Buffer.from(version + hash160 + checksum, "hex");
    const result = Base58.encode(addr);
    return result;
  }
  public isValidAddress(addr: string): boolean {
    const result = validate(addr);
    return !!result;
  }
  /**
   * 获取该地址的余额
   * @param addr
   */
  public getBalance(addr: string) {
    let balance = 0; // you start at zero!

    const chain = this.blockchain.chain;

    // 遍历每个区块以及每个区块内的交易
    for (const block of chain) {
      for (const trans of block.transactions) {
        // 如果地址是发起方 -> 减少余额
        if (trans.fromAddress === addr) {
          balance -= +trans.amount;
        }

        // 如果地址是接收方 -> 增加余额
        if (trans.toAddress === addr) {
          balance += +trans.amount;
        }
      }
    }

    return balance;
  }
}
