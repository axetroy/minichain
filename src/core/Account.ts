import { Service, Inject } from "typedi";
import { SHA256, RIPEMD160 } from "crypto-js";
import * as Base58 from "bs58";
import { BlockChain } from "./BlockChain";

@Service()
export class Account {
  @Inject()
  public blockchain!: BlockChain;
  // 地址生成看考: https://www.jianshu.com/p/954e143e97d2
  public generateAddrFromPublicKey(publicKey: string): string {
    // hash160运算就是先进行SHA256, 再进行RMD160
    // 结果加上前缀符, 一般是00
    // 结果执行2次SHA256, 取前8位作为校验和
    // 与有前缀符的结果合并
    // 最后进行base58加密
    const firstHash256 = SHA256(publicKey).toString();
    const H160 = RIPEMD160(firstHash256).toString();
    const containPrefix = "00" + H160;
    const secondHash256 = SHA256(containPrefix).toString();
    const checksum = secondHash256
      .split("")
      .slice(0, 8)
      .join("");
    return Base58.encode(Buffer.from(containPrefix + checksum, "hex"));
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
