## 迷你的区块链

基于 Typescript 打造的一个迷你的区块链程序

开发中...

Roadmap

- [ ] P2P 架构
- [ ] 区块浏览器
- [ ] 钱包地址

### 安装命令行 (TODO)

```bash
npm install @axetroy/mimichain-cli -g
```

### 生成钱包地址 (TODO)

```bash
# 生成私钥
openssl ecparam -name secp256k1 -genkey > private.pem
# 生成公钥
openssl ec -in private.pem -pubout -outform DER | tail -c 65 | xxd -p -c 65
```
