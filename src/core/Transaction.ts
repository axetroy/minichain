import { Service, Inject } from "typedi";
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
    if (!this.account.isValidAddress(fromAddress)) {
      throw new Error(`Invalid from address: ${fromAddress}`);
    }
    if (!this.account.isValidAddress(toAddress)) {
      throw new Error(`Invalid to address: ${toAddress}`);
    }
  }
}
