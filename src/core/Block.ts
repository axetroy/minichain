import { SHA256 } from 'crypto-js'

export class Block {
  public hash: string = ''  // 当前区块的hash
  public nonce: number = 0; // 挖矿难度
  /**
   * 实例化构造函数
   * @param index 
   * @param timestamp 
   * @param transactions 
   * @param previousHash 
   */
  constructor(public index: number, public timestamp: number, public transactions: any, public previousHash: string = '') {
    this.hash = this.computedHash()
  }
  public computedHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }
  /**
   * 挖矿
   * @param difficulty 
   */
  public mine(difficulty: number) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.computedHash();
    }
  }
}