import { Inject, Service } from 'typedi'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { BlockChain } from './core/BlockChain'

@Service()
export class Http {
  @Inject() public blockchain!: BlockChain
  private server: Koa = new Koa()
  constructor() {
    const app = this.server;
    const router = new Router();
    router.get('/chain/mine', async (ctx) => {
      const block = this.blockchain.minePendingTransactions('Axetroy的地址')
      ctx.body = block
    })
    router.get('/chain/latest', async (ctx) => {
      ctx.body = this.blockchain.chain
    })
    router.get('/chain', async (ctx) => {
      ctx.body = this.blockchain.latest
    })
    app.use(bodyParser());
    app
      .use(router.routes())
      .use(router.allowedMethods());
  }
  public listen(port) {
    return this.server.listen(port, () => {
      console.log(`Http server listen on port : ${port}`)
    })
  }
}