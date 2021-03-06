import { Service } from "typedi";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { Peer } from "../Peer";
import { Account } from "./Account";

@Service()
export class BlockChain {
  public chain: Block[] = [];
  public peer!: Peer;
  public account!: Account;
  private pendingTransactions: Transaction[] = []; // 在区块产生之间存储交易的地方
  private difficulty: number = 4;
  constructor() {
    this.chain.push(this.createGenesisBlock());
  }
  public get latest(): Block {
    return this.chain[this.chain.length - 1];
  }
  /**
   * 创建交易
   * @param transaction
   */
  public createTransaction(transaction: Transaction) {
    // TODO: 校验余额是否充足
    // TODO: 校验私钥
    // 推入待处理交易数组
    this.pendingTransactions.push(transaction);
    return transaction.toJson();
  }
  /**
   * 处理交易
   * @param miningRewardAddress
   */
  public minePendingTransactions(miningRewardAddress: string) {
    // 用所有待交易来创建新的区块并且开挖..
    const amountArray = this.pendingTransactions.map(v => +v.amount);
    const totalAmount = amountArray.reduce((a, b) => {
      return a + b;
    }, 0);
    const fee = ((totalAmount * 1) / 1000).toFixed(8);
    const block = new Block(
      this.latest.index + 1,
      Date.now(),
      [
        ...this.pendingTransactions,
        new Transaction("", miningRewardAddress, fee)
      ],
      this.latest.hash
    );
    block.mine(this.difficulty);

    // 将新挖的矿加入到链上
    // TODO: 写入文件系统
    this.chain.push(block);

    // 清空待处理列表
    this.pendingTransactions = [];

    return block;
  }
  /**
   * 计算矿工的奖励
   * @param transactions
   */
  public calcReward(transactions: Transaction[]) {
    //
  }
  /**
   * 获取地址的余额
   * @param address
   */
  public getBalanceOfAddress(address: string) {
    let balance = 0; // you start at zero!

    // 遍历每个区块以及每个区块内的交易
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        // 如果地址是发起方 -> 减少余额
        if (trans.fromAddress === address) {
          balance -= +trans.amount;
        }

        // 如果地址是接收方 -> 增加余额
        if (trans.toAddress === address) {
          balance += +trans.amount;
        }
      }
    }

    return balance;
  }
  /**
   * 检查链是否合法
   */
  public isChainValid(chain = this.chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.hash !== currentBlock.computedHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
  public replaceChain(newBlocks: Block[]): boolean {
    // 如果是合法的区块链， 并且新的区块链的长度>本地区块链的长度
    if (this.isChainValid(newBlocks) && newBlocks.length > this.chain.length) {
      console.log(
        "Received blockchain is valid. Replacing current blockchain with received blockchain"
      );
      // 替换掉当前的区块链
      this.chain = newBlocks;
      return true;
    } else {
      console.log("Received blockchain invalid");
      return false;
    }
  }
  /**
   * 创建创世区块
   */
  private createGenesisBlock() {
    const createdAt = parseInt(Date.now() / 1000 + "", 10);
    return new Block(0, createdAt, "Genesis block", "0");
  }
}
