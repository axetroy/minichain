import { Inject, Service, Container } from "typedi";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as Router from "koa-router";
import { BlockChain } from "./core/BlockChain";
import { Transaction } from "./core/Transaction";

@Service()
export class Http {
  @Inject()
  public blockchain!: BlockChain;
  private server: Koa = new Koa();
  constructor() {
    this.blockchain = Container.get(BlockChain);
    const app = this.server;
    const router = new Router();
    router.get("/chain/mine", async ctx => {
      const { addr } = ctx.query;
      if (!addr) {
        ctx.body = "需要指定addr参数才能挖矿";
        return;
      }
      const block = this.blockchain.minePendingTransactions(addr);
      ctx.body = block;
    });
    router.get("/chain/latest", async ctx => {
      ctx.body = this.blockchain.latest;
    });
    router.get("/chain", async ctx => {
      ctx.body = this.blockchain.chain;
    });
    router.get("/balance", async ctx => {
      const { addr } = ctx.query;
      if (!addr) {
        ctx.body = "需要指定addr参数";
        return;
      }
      ctx.body = this.blockchain.getBalanceOfAddress(addr);
    });
    router.post("/transaction", async ctx => {
      const { fromAddress, toAddress, amount } = ctx.request.body;
      ctx.body = this.blockchain.createTransaction(
        new Transaction(fromAddress, toAddress, amount)
      );
    });
    app.use(bodyParser());
    app.use(router.routes()).use(router.allowedMethods());
  }
  public listen(port) {
    return this.server.listen(port, () => {
      console.log(`Http server listen on port : ${port}`);
    });
  }
}
