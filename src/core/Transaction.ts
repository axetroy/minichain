import { Container, Service, Inject } from "typedi";
import { Account } from "./Account";

@Service()
export class Transaction {
  @Inject()
  public account!: Account;
  constructor(
    public fromAddress: string,
    public toAddress: string,
    public amount: string,
    note?: string
  ) {
    this.account = Container.get(Account);
    if (!this.account.isValidAddress(fromAddress)) {
      throw new Error(`Invalid from address: ${fromAddress}`);
    }
    if (!this.account.isValidAddress(toAddress)) {
      throw new Error(`Invalid to address: ${toAddress}`);
    }
  }
  public toJson() {
    return {
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount
    };
  }
}
