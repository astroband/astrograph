import fs from "fs";
import ProgressBar from "progress";
import zlib from "zlib";
import { db } from "./database";
import { AccountFactory, IAccountTableRow } from "./model/factories/account_factory";
import { AccountBuilder } from "./storage/builders";
import logger from "./util/logger";

const dir = `export/accounts-${new Date().toISOString()}`;

fs.mkdirSync(dir, { recursive: true });

async function exportAccounts(): Promise<number> {
  const batchSize = 1000;
  const batchesInFile = 100;
  let offset = 0;
  const accountsCount = await db.accounts.count();

  const bar = new ProgressBar("[:bar] :elapseds elapsed, eta :etas", { total: accountsCount });

  const batchesCount = Math.ceil(accountsCount / batchSize);
  let file = zlib.createGzip();

  for (let i = 0; i < batchesCount; i += 1) {
    if (i % batchesInFile === 0) {
      file.end();
      file = zlib.createGzip();

      file.pipe(fs.createWriteStream(`${dir}/${Math.ceil(i / batchesInFile)}.rdf.gz`));
    }

    const rows: IAccountTableRow[] = await db.any("SELECT * FROM accounts LIMIT $1 OFFSET $2", [batchSize, offset]);

    rows.forEach(row => {
      const account = AccountFactory.fromDb(row);
      const builder = new AccountBuilder(account);

      file.write(builder.build().toString() + "\n");
      bar.tick();
    });

    offset += batchSize;
  }

  file.end();

  return accountsCount;
}

exportAccounts().then((accountsCount: number) => {
  logger.info(`${accountsCount} accounts have been exported "${dir}" directory`);
});
