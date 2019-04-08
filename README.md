## 迷你的区块链

[![Greenkeeper badge](https://badges.greenkeeper.io/axetroy/minichain.svg)](https://greenkeeper.io/)

这是一个试验性项目. 用 Typescript 开发，打造的一个迷你的区块链程序

#### Milestone 1

- [ ] 比特币规则 (钱包生成地址/加密/交易规则等)
- [ ] 钱包功能
- [ ] 交易
- [ ] 挖矿
- [ ] 实现分布式区块

#### Milestone 2

- [ ] 区块浏览器
- [ ] 发行代币
- [ ] 智能合约

### 安装命令行

```bash
# TODO: 未发布
npm install @axetroy/mimichain-cli -g
```

### 生成钱包地址

```bash
# 生成私钥
openssl ecparam -name secp256k1 -genkey > private.pem
# 生成公钥
openssl ec -in private.pem -pubout -outform DER | tail -c 65 | xxd -p -c 65 > key.pub
# 生产钱包地址
npx @axetroy/mimichain-cli generate ./key.pub
```
