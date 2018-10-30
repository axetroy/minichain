import "reflect-metadata";
import { resolve } from "path";
import * as fs from "fs";
import * as os from "os";
import * as program from "caporal";
import * as pkg from "../../package.json";

import { Container } from "typedi";
import { Account } from "../core/Account";

program.version(pkg.version).description(pkg.description);

program
  .command("generate", "generate coin address from public key file")
  .argument(
    "[public_key_path]",
    "path of public key file",
    /.*/,
    resolve(process.cwd(), "key.pub")
  )
  .action((argv, options) => {
    const account = Container.get(Account);
    const publicKey = fs.readFileSync(argv.publicKeyPath, "utf8");
    const addr = account.generateAddrFromPublicKey(publicKey);
    process.stdout.write(addr);
    process.stdout.write("\n");
  });

program.parse(process.argv);
