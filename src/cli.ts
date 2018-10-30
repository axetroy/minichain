import "reflect-metadata";
import * as program from "caporal";
import * as pkg from "../package.json";

import { Container } from "typedi";
import { Account } from "./core/Account";

program.version(pkg.version).description(pkg.description);

program
  .command("wallet", "通过共钥生成钱包地址")
  .argument("<key>", "公钥")
  .action((argv, options) => {
    const account = Container.get(Account);
    const addr = account.generateAddrFromPublicKey(argv.key);
    process.stdout.write(addr);
    process.stdout.write("\n");
  });

program.parse(process.argv);
