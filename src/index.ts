import "reflect-metadata";
import { Inject, Container, Service } from 'typedi'
import { Peer } from './Peer'
import { Http } from './Http'

@Service()
class Main {
  @Inject() public peer!: Peer;
  @Inject() public http!: Http;
  public start() {
    this.peer.listen(process.env.PORT ? Number(process.env.PORT) : 1234)
    this.http.listen(4321)
  }
}

const main = Container.get(Main)

main.start()