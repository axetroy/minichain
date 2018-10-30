import { Inject, Service, Container } from "typedi";
import * as WebSocket from "ws";
import { BlockChain } from "./core/BlockChain";

enum MessageType {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN
}

@Service()
export class Peer {
  @Inject()
  public blockchain!: BlockChain;
  private server: WebSocket.Server | null = null;
  // 初始化需要连接的服务器
  private initialPeers: string[] = process.env.PEERS
    ? process.env.PEERS.split(",")
    : [];
  // 当前已链接的 socket
  private sockets: WebSocket[] = [];
  constructor() {
    // 连接至中心服务器
    this.blockchain = Container.get(BlockChain);
    this.blockchain.peer = this;
    this.connect(this.initialPeers);
  }
  /**
   * 连接到服务器
   * @param peers
   */
  public connect(peers: string[]) {
    peers.forEach(peer => {
      // 使用Websocket协议
      const ws = new WebSocket(peer);
      // 链接成功后，进行初始化操作
      ws.on("open", () => this.initConnection(ws));
      ws.on("error", err => {
        console.log("connection failed", err);
      });
    });
  }
  /**
   * 创建本地服务器
   */
  public listen(port: number) {
    const server = (this.server = new WebSocket.Server({ port }));
    server.on("listening", () => {
      console.log(`WebSocket server listen on port : ${port}`);
    });
    server.on("connection", ws => this.initConnection(ws));
  }
  /**
   * 广播
   * @param message
   */
  public broadcast(message) {
    this.sockets.forEach(ws => ws.send(JSON.stringify(message)));
  }
  /**
   * 销毁服务器
   */
  public destroy() {
    if (this.server) {
      this.server.close();
    }
  }
  /**
   * 初始化sockets链接
   * @param ws
   */
  private initConnection(ws) {
    // 记录当前已链接的socket
    this.sockets.push(ws);
    // 初始化信息接收器
    ws.on("message", (data: any) => {
      // 反序列化接收到的消息字符串
      const message = JSON.parse(data);
      console.log("Received message" + JSON.stringify(message));
      // 根据消息类型进行对应的处理
      switch (message.type) {
        // 获取最新的区块
        case MessageType.QUERY_LATEST:
          ws.send(
            JSON.stringify({
              type: MessageType.RESPONSE_BLOCKCHAIN,
              data: JSON.stringify([this.blockchain.latest])
            })
          );
          break;
        // 获取整个区块链
        case MessageType.QUERY_ALL:
          // write(ws, responseChainMsg());
          ws.send(
            JSON.stringify({
              type: MessageType.RESPONSE_BLOCKCHAIN,
              data: JSON.stringify(this.blockchain.chain)
            })
          );
          break;
        /**
         * 如果收到来自其他节点的区块消息
         */
        case MessageType.RESPONSE_BLOCKCHAIN:
          const blockchain = this.blockchain.chain;
          /**
           * 反序列化收到的区块链
           * 并且根据index从小到大排序
           * @type {Array.<T>}
           */
          const receivedBlocks = JSON.parse(message.data).sort(
            (b1, b2) => b1.index - b2.index
          );
          // 收到的最新区块
          const remoteLatestBlock = receivedBlocks[receivedBlocks.length - 1];
          // 当前本地的最新区块
          const localLatestBlock = this.blockchain.latest;

          // 如果收到的最新区块的索引，大于本地的最新区块
          // 那么可能会进行同步操作
          if (remoteLatestBlock.index > localLatestBlock.index) {
            console.log(
              "blockchain possibly behind. We got: " +
                localLatestBlock.index +
                " Peer got: " +
                remoteLatestBlock.index
            );
            // 如果本地区块的hash，是接受到的最新区块的上一个hash
            // 即: 最新本地区块 > 接受到的最新区块
            if (localLatestBlock.hash === remoteLatestBlock.previousHash) {
              console.log("We can append the received block to our chain");
              // 那么就认可这个区块， 加入到本地的区块链中
              blockchain.push(remoteLatestBlock);
              // 并且广播当前获取的最新区块
              this.broadcast({
                type: MessageType.RESPONSE_BLOCKCHAIN,
                data: JSON.stringify([this.blockchain.latest])
              });
            } else if (receivedBlocks.length === 1) {
              // 如果接受到的区块链长度为1, 那么这个区块链是刚刚创建的，没有从p2p网络中同步区块
              console.log("We have to query the chain from our peer");
              // 广播给其他人，同步区块链
              this.broadcast({ type: MessageType.QUERY_ALL });
            } else {
              // 如果新生成的链是这样的
              // 最新本地区块 > 区块A > 区块 > B > ... > 接受到的最新区块
              // 那么整条链就落后了，需要替换掉整块链
              console.log(
                "Received blockchain is longer than current blockchain"
              );
              const success = this.blockchain.replaceChain(receivedBlocks);
              if (success) {
                this.broadcast(receivedBlocks);
              }
            }
          } else {
            // 接收到的区块链可能比本地的区块链还要旧，那么什么都不用做
            console.log(
              "received blockchain is not longer than current blockchain. Do nothing"
            );
          }
          break;
      }
    });
    // 初始化错误信息接收器
    const closeConnection = () => {
      console.log("connection failed to peer: " + ws.url);
      this.sockets.splice(this.sockets.indexOf(ws), 1);
    };
    // 如果链接关闭或发生错误，都会把链接从本地中移除
    ws.on("close", () => closeConnection);
    ws.on("error", () => closeConnection);
    ws.send(JSON.stringify({ type: MessageType.QUERY_LATEST }));
  }
}
