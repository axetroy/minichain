import { Peer } from './Peer'
import { BlockChain } from './core/BlockChain'

const coin = new BlockChain(5);
const peer = new Peer(coin);

peer.serve(process.env.PORT ? Number(process.env.PORT) : 1234)